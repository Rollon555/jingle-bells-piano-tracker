// ============================================
// JINGLE BELLS PIANO TRACKER - MAIN APPLICATION
// ============================================

import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.38.4/+esm';

// ============================================
// CONFIGURATION
// ============================================

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
const API_BASE = '/.netlify/functions';

// Initialize Supabase
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    realtime: {
        params: {
            eventsPerSecond: 10,
        },
    },
});

// ============================================
// STATE MANAGEMENT
// ============================================

const state = {
    classes: [],
    students: [],
    currentClassId: null,
    isUnlocked: false,
    isLoading: true,
    subscriptions: [],
};

// ============================================
// DOM ELEMENTS
// ============================================

const dom = {
    loadingState: document.getElementById('loadingState'),
    errorState: document.getElementById('errorState'),
    errorMessage: document.getElementById('errorMessage'),
    retryBtn: document.getElementById('retryBtn'),
    contentState: document.getElementById('contentState'),
    
    lockBtn: document.getElementById('lockBtn'),
    lockStatus: document.getElementById('lockStatus'),
    
    classSelect: document.getElementById('classSelect'),
    addClassBtn: document.getElementById('addClassBtn'),
    editClassBtn: document.getElementById('editClassBtn'),
    deleteClassBtn: document.getElementById('deleteClassBtn'),
    
    totalCount: document.getElementById('totalCount'),
    passedCount: document.getElementById('passedCount'),
    pendingCount: document.getElementById('pendingCount'),
    
    addStudentBtn: document.getElementById('addStudentBtn'),
    resetBtn: document.getElementById('resetBtn'),
    studentsList: document.getElementById('studentsList'),
    
    // Modals
    passwordModal: document.getElementById('passwordModal'),
    passwordInput: document.getElementById('passwordInput'),
    passwordError: document.getElementById('passwordError'),
    submitPasswordBtn: document.getElementById('submitPasswordBtn'),
    cancelPasswordBtn: document.getElementById('cancelPasswordBtn'),
    
    classNameModal: document.getElementById('classNameModal'),
    classModalTitle: document.getElementById('classModalTitle'),
    classNameInput: document.getElementById('classNameInput'),
    classError: document.getElementById('classError'),
    submitClassBtn: document.getElementById('submitClassBtn'),
    cancelClassBtn: document.getElementById('cancelClassBtn'),
    
    studentNameModal: document.getElementById('studentNameModal'),
    studentNameInput: document.getElementById('studentNameInput'),
    studentError: document.getElementById('studentError'),
    submitStudentBtn: document.getElementById('submitStudentBtn'),
    cancelStudentBtn: document.getElementById('cancelStudentBtn'),
    
    confirmModal: document.getElementById('confirmModal'),
    confirmTitle: document.getElementById('confirmTitle'),
    confirmMessage: document.getElementById('confirmMessage'),
    confirmBtn: document.getElementById('confirmBtn'),
    cancelConfirmBtn: document.getElementById('cancelConfirmBtn'),
};

// ============================================
// INITIALIZATION
// ============================================

async function initializeApp() {
    try {
        dom.loadingState.style.display = 'flex';
        dom.errorState.style.display = 'none';
        dom.contentState.style.display = 'none';
        
        // Load initial data
        await loadClasses();
        
        // Setup realtime subscriptions
        setupRealtimeSubscriptions();
        
        // Restore unlock state if exists
        restoreUnlockState();
        
        // Setup event listeners
        setupEventListeners();
        
        // Show content
        state.isLoading = false;
        dom.loadingState.style.display = 'none';
        dom.contentState.style.display = 'block';
        
    } catch (error) {
        console.error('Initialization error:', error);
        showError('ไม่สามารถเชื่อมต่อฐานข้อมูลได้ กรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ต');
    }
}

// ============================================
// DATA LOADING
// ============================================

async function loadClasses() {
    try {
        const { data, error } = await supabase
            .from('classes')
            .select('id, name, created_at')
            .order('created_at', { ascending: true });
        
        if (error) throw error;
        
        state.classes = data || [];
        
        // Set first class as default
        if (state.classes.length > 0 && !state.currentClassId) {
            state.currentClassId = state.classes[0].id;
        }
        
        updateClassDropdown();
        await loadStudents();
        
    } catch (error) {
        console.error('Error loading classes:', error);
        throw error;
    }
}

async function loadStudents() {
    if (!state.currentClassId) return;
    
    try {
        const { data, error } = await supabase
            .from('students')
            .select('id, class_id, full_name, passed, sort_order, created_at')
            .eq('class_id', state.currentClassId)
            .order('sort_order', { ascending: true });
        
        if (error) throw error;
        
        state.students = data || [];
        updateStudentsList();
        updateStats();
        
    } catch (error) {
        console.error('Error loading students:', error);
    }
}

// ============================================
// REALTIME SUBSCRIPTIONS
// ============================================

function setupRealtimeSubscriptions() {
    // Unsubscribe from previous subscriptions
    state.subscriptions.forEach(sub => sub.unsubscribe());
    state.subscriptions = [];
    
    // Subscribe to classes changes
    const classesSubscription = supabase
        .channel('classes-changes')
        .on('postgres_changes', 
            { event: '*', schema: 'public', table: 'classes' },
            (payload) => {
                console.log('Classes change:', payload);
                handleClassesChange(payload);
            }
        )
        .subscribe();
    
    state.subscriptions.push(classesSubscription);
    
    // Subscribe to students changes
    const studentsSubscription = supabase
        .channel('students-changes')
        .on('postgres_changes',
            { event: '*', schema: 'public', table: 'students' },
            (payload) => {
                console.log('Students change:', payload);
                handleStudentsChange(payload);
            }
        )
        .subscribe();
    
    state.subscriptions.push(studentsSubscription);
}

function handleClassesChange(payload) {
    const { eventType, new: newData, old: oldData } = payload;
    
    if (eventType === 'INSERT') {
        state.classes.push(newData);
        updateClassDropdown();
    } else if (eventType === 'UPDATE') {
        const index = state.classes.findIndex(c => c.id === newData.id);
        if (index >= 0) {
            state.classes[index] = newData;
            updateClassDropdown();
        }
    } else if (eventType === 'DELETE') {
        state.classes = state.classes.filter(c => c.id !== oldData.id);
        
        // If deleted class was selected, select first class
        if (state.currentClassId === oldData.id) {
            state.currentClassId = state.classes[0]?.id || null;
        }
        
        updateClassDropdown();
        loadStudents();
    }
}

function handleStudentsChange(payload) {
    const { eventType, new: newData, old: oldData } = payload;
    
    // Only update if it's for the current class
    if (eventType === 'INSERT' && newData.class_id === state.currentClassId) {
        state.students.push(newData);
        state.students.sort((a, b) => a.sort_order - b.sort_order);
        updateStudentsList();
        updateStats();
    } else if (eventType === 'UPDATE' && newData.class_id === state.currentClassId) {
        const index = state.students.findIndex(s => s.id === newData.id);
        if (index >= 0) {
            state.students[index] = newData;
            state.students.sort((a, b) => a.sort_order - b.sort_order);
            updateStudentsList();
            updateStats();
        }
    } else if (eventType === 'DELETE' && oldData.class_id === state.currentClassId) {
        state.students = state.students.filter(s => s.id !== oldData.id);
        updateStudentsList();
        updateStats();
    }
}

// ============================================
// UI UPDATES
// ============================================

function updateClassDropdown() {
    dom.classSelect.innerHTML = '<option value="">-- เลือกชั้นเรียน --</option>';
    
    state.classes.forEach(cls => {
        const option = document.createElement('option');
        option.value = cls.id;
        option.textContent = cls.name;
        if (cls.id === state.currentClassId) {
            option.selected = true;
        }
        dom.classSelect.appendChild(option);
    });
    
    // Update button states
    dom.editClassBtn.disabled = !state.currentClassId || !state.isUnlocked;
    dom.deleteClassBtn.disabled = !state.currentClassId || !state.isUnlocked || state.classes.length <= 1;
}

function updateStudentsList() {
    dom.studentsList.innerHTML = '';
    
    state.students.forEach((student, index) => {
        const studentItem = document.createElement('div');
        studentItem.className = `student-item ${student.passed ? 'passed' : ''}`;
        
        studentItem.innerHTML = `
            <div class="student-checkbox-wrapper">
                <input 
                    type="checkbox" 
                    class="student-checkbox" 
                    ${student.passed ? 'checked' : ''}
                    ${!state.isUnlocked ? 'disabled' : ''}
                    aria-label="สถานะผ่านของ ${student.full_name}"
                    data-student-id="${student.id}"
                />
            </div>
            <div class="student-number">${index + 1}</div>
            <div class="student-name">${student.full_name}</div>
            <div class="student-status">✅</div>
            ${state.isUnlocked ? `
                <div class="student-actions">
                    <button 
                        class="btn btn-small btn-secondary" 
                        data-action="edit-student" 
                        data-student-id="${student.id}"
                        aria-label="แก้ไข ${student.full_name}"
                    >
                        ✏️
                    </button>
                    <button 
                        class="btn btn-small btn-danger" 
                        data-action="delete-student" 
                        data-student-id="${student.id}"
                        aria-label="ลบ ${student.full_name}"
                    >
                        🗑️
                    </button>
                </div>
            ` : ''}
        `;
        
        // Add checkbox change listener
        const checkbox = studentItem.querySelector('.student-checkbox');
        checkbox.addEventListener('change', () => toggleStudentStatus(student.id, checkbox.checked));
        
        // Add action buttons if unlocked
        if (state.isUnlocked) {
            const editBtn = studentItem.querySelector('[data-action="edit-student"]');
            const deleteBtn = studentItem.querySelector('[data-action="delete-student"]');
            
            if (editBtn) editBtn.addEventListener('click', () => editStudent(student));
            if (deleteBtn) deleteBtn.addEventListener('click', () => confirmDelete('student', student.id, student.full_name));
        }
        
        dom.studentsList.appendChild(studentItem);
    });
}

function updateStats() {
    const total = state.students.length;
    const passed = state.students.filter(s => s.passed).length;
    const pending = total - passed;
    
    // Update with animation
    animateStatUpdate(dom.totalCount, total);
    animateStatUpdate(dom.passedCount, passed);
    animateStatUpdate(dom.pendingCount, pending);
}

function animateStatUpdate(element, newValue) {
    const currentValue = parseInt(element.textContent);
    
    if (currentValue !== newValue) {
        element.style.animation = 'none';
        setTimeout(() => {
            element.textContent = newValue;
            element.style.animation = 'countUp 300ms ease-out';
        }, 10);
    } else {
        element.textContent = newValue;
    }
}

// ============================================
// USER ACTIONS - CLASS MANAGEMENT
// ============================================

async function toggleStudentStatus(studentId, passed) {
    if (!state.isUnlocked) return;
    
    try {
        const { error } = await supabase
            .from('students')
            .update({ passed })
            .eq('id', studentId);
        
        if (error) throw error;
        
    } catch (error) {
        console.error('Error updating student status:', error);
        showError('ไม่สามารถอัปเดตสถานะได้');
    }
}

async function addClass() {
    if (!state.isUnlocked) return;
    
    dom.classModalTitle.textContent = 'เพิ่มชั้นเรียน';
    dom.classNameInput.value = '';
    dom.classError.style.display = 'none';
    dom.classNameModal.style.display = 'flex';
    dom.classNameInput.focus();
    
    const tempHandler = async (e) => {
        e.preventDefault();
        
        const name = dom.classNameInput.value.trim();
        
        if (!name) {
            showClassError('กรุณากรอกชื่อชั้นเรียน');
            return;
        }
        
        // Check for duplicate
        if (state.classes.some(c => c.name === name)) {
            showClassError('ชั้นเรียนนี้มีอยู่แล้ว');
            return;
        }
        
        try {
            const { data, error } = await supabase
                .from('classes')
                .insert({ name })
                .select();
            
            if (error) throw error;
            
            if (data && data[0]) {
                state.currentClassId = data[0].id;
                closeModal(dom.classNameModal);
                dom.classSelect.value = state.currentClassId;
                await loadStudents();
            }
            
        } catch (error) {
            console.error('Error adding class:', error);
            showClassError('เพิ่มชั้นเรียนไม่สำเร็จ');
        }
    };
    
    dom.submitClassBtn.onclick = tempHandler;
}

async function editClass() {
    if (!state.currentClassId || !state.isUnlocked) return;
    
    const currentClass = state.classes.find(c => c.id === state.currentClassId);
    if (!currentClass) return;
    
    dom.classModalTitle.textContent = 'แก้ไขชื่อชั้นเรียน';
    dom.classNameInput.value = currentClass.name;
    dom.classError.style.display = 'none';
    dom.classNameModal.style.display = 'flex';
    dom.classNameInput.focus();
    dom.classNameInput.select();
    
    const tempHandler = async (e) => {
        e.preventDefault();
        
        const name = dom.classNameInput.value.trim();
        
        if (!name) {
            showClassError('กรุณากรอกชื่อชั้นเรียน');
            return;
        }
        
        if (name === currentClass.name) {
            closeModal(dom.classNameModal);
            return;
        }
        
        // Check for duplicate
        if (state.classes.some(c => c.name === name && c.id !== state.currentClassId)) {
            showClassError('ชั้นเรียนนี้มีอยู่แล้ว');
            return;
        }
        
        try {
            const { error } = await supabase
                .from('classes')
                .update({ name })
                .eq('id', state.currentClassId);
            
            if (error) throw error;
            
            closeModal(dom.classNameModal);
            
        } catch (error) {
            console.error('Error editing class:', error);
            showClassError('แก้ไขชั้นเรียนไม่สำเร็จ');
        }
    };
    
    dom.submitClassBtn.onclick = tempHandler;
}

function deleteClass() {
    if (!state.currentClassId || !state.isUnlocked || state.classes.length <= 1) return;
    
    const currentClass = state.classes.find(c => c.id === state.currentClassId);
    if (!currentClass) return;
    
    confirmDelete('class', state.currentClassId, currentClass.name);
}

// ============================================
// USER ACTIONS - STUDENT MANAGEMENT
// ============================================

async function addStudent() {
    if (!state.currentClassId || !state.isUnlocked) return;
    
    dom.studentNameInput.value = '';
    dom.studentError.style.display = 'none';
    dom.studentNameModal.style.display = 'flex';
    dom.studentNameInput.focus();
    
    const tempHandler = async (e) => {
        e.preventDefault();
        
        const fullName = dom.studentNameInput.value.trim();
        
        if (!fullName) {
            showStudentError('กรุณากรอกชื่อ-นามสกุล');
            return;
        }
        
        try {
            // Get max sort_order for current class
            const { data: students } = await supabase
                .from('students')
                .select('sort_order')
                .eq('class_id', state.currentClassId)
                .order('sort_order', { ascending: false })
                .limit(1);
            
            const maxSortOrder = students && students[0] ? students[0].sort_order : 0;
            const newSortOrder = maxSortOrder + 1;
            
            const { error } = await supabase
                .from('students')
                .insert({
                    class_id: state.currentClassId,
                    full_name: fullName,
                    sort_order: newSortOrder,
                });
            
            if (error) throw error;
            
            closeModal(dom.studentNameModal);
            
        } catch (error) {
            console.error('Error adding student:', error);
            showStudentError('เพิ่มรายชื่อไม่สำเร็จ');
        }
    };
    
    dom.submitStudentBtn.onclick = tempHandler;
}

async function editStudent(student) {
    if (!state.isUnlocked) return;
    
    dom.studentNameInput.value = student.full_name;
    dom.studentError.style.display = 'none';
    dom.studentNameModal.style.display = 'flex';
    dom.studentNameInput.focus();
    dom.studentNameInput.select();
    
    const tempHandler = async (e) => {
        e.preventDefault();
        
        const fullName = dom.studentNameInput.value.trim();
        
        if (!fullName) {
            showStudentError('กรุณากรอกชื่อ-นามสกุล');
            return;
        }
        
        if (fullName === student.full_name) {
            closeModal(dom.studentNameModal);
            return;
        }
        
        try {
            const { error } = await supabase
                .from('students')
                .update({ full_name: fullName })
                .eq('id', student.id);
            
            if (error) throw error;
            
            closeModal(dom.studentNameModal);
            
        } catch (error) {
            console.error('Error editing student:', error);
            showStudentError('แก้ไขรายชื่อไม่สำเร็จ');
        }
    };
    
    dom.submitStudentBtn.onclick = tempHandler;
}

async function resetAllStatus() {
    if (!state.currentClassId || !state.isUnlocked) return;
    
    dom.confirmTitle.textContent = 'รีเซ็ตผลการบันทึก';
    dom.confirmMessage.textContent = 'คุณต้องการรีเซ็ตสถานะ "ผ่านแล้ว" ของทุกคนในชั้นเรียนนี้หรือไม่ การกระทำนี้ไม่สามารถยกเลิกได้';
    dom.confirmModal.style.display = 'flex';
    
    const tempHandler = async () => {
        try {
            const { error } = await supabase
                .from('students')
                .update({ passed: false })
                .eq('class_id', state.currentClassId);
            
            if (error) throw error;
            
            closeModal(dom.confirmModal);
            
        } catch (error) {
            console.error('Error resetting status:', error);
            showError('รีเซ็ตไม่สำเร็จ');
        }
    };
    
    dom.confirmBtn.onclick = tempHandler;
}

// ============================================
// CONFIRMATION & DELETION
// ============================================

function confirmDelete(type, id, name) {
    const messages = {
        class: `คุณต้องการลบชั้นเรียน "${name}" หรือไม่ การกระทำนี้จะลบรายชื่อทั้งหมดในชั้นเรียนนี้ด้วย ไม่สามารถยกเลิกได้`,
        student: `คุณต้องการลบ "${name}" หรือไม่ ไม่สามารถยกเลิกได้`,
    };
    
    dom.confirmTitle.textContent = 'ยืนยันการลบ';
    dom.confirmMessage.textContent = messages[type] || 'ยืนยันการกระทำ';
    dom.confirmModal.style.display = 'flex';
    
    const tempHandler = async () => {
        try {
            if (type === 'class') {
                const { error } = await supabase
                    .from('classes')
                    .delete()
                    .eq('id', id);
                
                if (error) throw error;
                
            } else if (type === 'student') {
                const { error } = await supabase
                    .from('students')
                    .delete()
                    .eq('id', id);
                
                if (error) throw error;
            }
            
            closeModal(dom.confirmModal);
            
        } catch (error) {
            console.error('Error deleting:', error);
            showError('ลบไม่สำเร็จ');
        }
    };
    
    dom.confirmBtn.onclick = tempHandler;
}

// ============================================
// AUTHENTICATION & LOCK SYSTEM
// ============================================

async function unlockApp() {
    dom.passwordInput.value = '';
    dom.passwordError.style.display = 'none';
    dom.passwordModal.style.display = 'flex';
    dom.passwordInput.focus();
    
    const tempHandler = async (e) => {
        e.preventDefault();
        
        const password = dom.passwordInput.value;
        
        if (!password) {
            showPasswordError('กรุณากรอกรหัสผ่าน');
            return;
        }
        
        try {
            dom.submitPasswordBtn.disabled = true;
            
            const response = await fetch(`${API_BASE}/verify-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password }),
            });
            
            const result = await response.json();
            
            if (result.success) {
                state.isUnlocked = true;
                sessionStorage.setItem('unlocked', 'true');
                sessionStorage.setItem('unlockedAt', Date.now().toString());
                
                updateUIForUnlock();
                closeModal(dom.passwordModal);
                
            } else {
                showPasswordError('รหัสผ่านไม่ถูกต้อง');
            }
            
        } catch (error) {
            console.error('Error verifying password:', error);
            showPasswordError('ตรวจสอบรหัสผ่านไม่สำเร็จ');
        } finally {
            dom.submitPasswordBtn.disabled = false;
        }
    };
    
    dom.submitPasswordBtn.onclick = tempHandler;
}

function lockApp() {
    state.isUnlocked = false;
    sessionStorage.removeItem('unlocked');
    sessionStorage.removeItem('unlockedAt');
    
    updateUIForLock();
}

function restoreUnlockState() {
    const wasUnlocked = sessionStorage.getItem('unlocked');
    if (wasUnlocked) {
        state.isUnlocked = true;
        updateUIForUnlock();
    }
}

function updateUIForUnlock() {
    dom.lockBtn.textContent = '🔓 ล็อกการบันทึกผล';
    dom.lockBtn.onclick = lockApp;
    dom.lockStatus.style.display = 'block';
    
    dom.addClassBtn.disabled = false;
    dom.editClassBtn.disabled = !state.currentClassId;
    dom.deleteClassBtn.disabled = !state.currentClassId || state.classes.length <= 1;
    dom.addStudentBtn.disabled = !state.currentClassId;
    dom.resetBtn.disabled = !state.currentClassId;
    
    updateStudentsList(); // Refresh to show edit/delete buttons
}

function updateUIForLock() {
    dom.lockBtn.textContent = '🔒 ปลดล็อกการบันทึกผล';
    dom.lockBtn.onclick = unlockApp;
    dom.lockStatus.style.display = 'none';
    
    dom.addClassBtn.disabled = true;
    dom.editClassBtn.disabled = true;
    dom.deleteClassBtn.disabled = true;
    dom.addStudentBtn.disabled = true;
    dom.resetBtn.disabled = true;
    
    updateStudentsList(); // Refresh to hide edit/delete buttons
}

// ============================================
// MODAL HELPERS
// ============================================

function closeModal(modal) {
    modal.style.display = 'none';
    dom.classError.style.display = 'none';
    dom.studentError.style.display = 'none';
    dom.passwordError.style.display = 'none';
}

function showPasswordError(message) {
    dom.passwordError.textContent = message;
    dom.passwordError.style.display = 'block';
}

function showClassError(message) {
    dom.classError.textContent = message;
    dom.classError.style.display = 'block';
}

function showStudentError(message) {
    dom.studentError.textContent = message;
    dom.studentError.style.display = 'block';
}

function showError(message) {
    dom.errorMessage.textContent = message;
    dom.errorState.style.display = 'flex';
    dom.contentState.style.display = 'none';
    dom.loadingState.style.display = 'none';
}

// ============================================
// EVENT LISTENERS SETUP
// ============================================

function setupEventListeners() {
    // Class management
    dom.classSelect.addEventListener('change', (e) => {
        state.currentClassId = e.target.value || null;
        if (state.currentClassId) {
            loadStudents();
        }
        updateClassDropdown();
    });
    
    dom.addClassBtn.addEventListener('click', addClass);
    dom.editClassBtn.addEventListener('click', editClass);
    dom.deleteClassBtn.addEventListener('click', deleteClass);
    
    // Student management
    dom.addStudentBtn.addEventListener('click', addStudent);
    dom.resetBtn.addEventListener('click', resetAllStatus);
    
    // Lock system
    dom.lockBtn.addEventListener('click', () => {
        if (state.isUnlocked) {
            lockApp();
        } else {
            unlockApp();
        }
    });
    
    // Password modal
    dom.submitPasswordBtn.addEventListener('click', (e) => {
        e.preventDefault();
        dom.submitPasswordBtn.click(); // Trigger the temp handler
    });
    
    dom.cancelPasswordBtn.addEventListener('click', () => closeModal(dom.passwordModal));
    dom.passwordInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') dom.submitPasswordBtn.click();
    });
    
    // Class name modal
    dom.submitClassBtn.addEventListener('click', (e) => e.preventDefault());
    dom.cancelClassBtn.addEventListener('click', () => closeModal(dom.classNameModal));
    dom.classNameInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') dom.submitClassBtn.click();
    });
    
    // Student name modal
    dom.submitStudentBtn.addEventListener('click', (e) => e.preventDefault());
    dom.cancelStudentBtn.addEventListener('click', () => closeModal(dom.studentNameModal));
    dom.studentNameInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') dom.submitStudentBtn.click();
    });
    
    // Confirmation modal
    dom.cancelConfirmBtn.addEventListener('click', () => closeModal(dom.confirmModal));
    
    // Retry button
    dom.retryBtn.addEventListener('click', () => {
        dom.errorState.style.display = 'none';
        initializeApp();
    });
    
    // Close modals on outside click
    [dom.passwordModal, dom.classNameModal, dom.studentNameModal, dom.confirmModal].forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal(modal);
            }
        });
    });
}

// ============================================
// CLEANUP
// ============================================

window.addEventListener('beforeunload', () => {
    state.subscriptions.forEach(sub => sub.unsubscribe());
});

// ============================================
// START APPLICATION
// ============================================

document.addEventListener('DOMContentLoaded', initializeApp);
