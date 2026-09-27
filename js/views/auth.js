/**
 * Authentication (Login & Register) and User Management Views
 */
import { escapeHtml } from '../utils/helpers.js';
import { toast } from '../utils/toast.js';

/**
 * Full-screen Login & Registration Screen
 */
export function renderAuthScreen(container, state, onLoginSuccess) {
  let activeTab = 'login'; // 'login' or 'register'
  const demoUsers = state.getRegisteredUsers();

  function render() {
    container.innerHTML = `
      <div class="auth-page-wrapper animate-fade-in">
        <div class="auth-card-container">
          
          <!-- Brand Header -->
          <div class="auth-brand-header">
            <div class="auth-logo-icon">⚡</div>
            <h1 class="auth-brand-title">LEAD <span style="color: var(--primary);">MANAGER</span></h1>
            <p class="auth-brand-subtitle">Data Alcott Systems &bull; Enterprise CRM Portal</p>
          </div>

          <!-- Auth Card Box -->
          <div class="auth-card">
            
            <!-- Auth Tab Switcher -->
            <div class="auth-tabs">
              <button class="auth-tab-btn ${activeTab === 'login' ? 'active' : ''}" data-tab="login">
                Sign In
              </button>
              <button class="auth-tab-btn ${activeTab === 'register' ? 'active' : ''}" data-tab="register">
                Create Account
              </button>
            </div>

            <!-- LOGIN VIEW -->
            ${activeTab === 'login' ? `
              <form id="form-auth-login" class="auth-form">
                <div class="form-group">
                  <label class="form-label required">Email Address</label>
                  <input
                    type="email"
                    name="email"
                    id="login-email"
                    class="form-control"
                    placeholder="Enter your email address"
                    required
                  />
                </div>

                <div class="form-group">
                  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.35rem;">
                    <label class="form-label required" style="margin-bottom: 0;">Password</label>
                    <a href="javascript:void(0)" id="btn-forgot-password" style="font-size: 0.75rem; color: var(--primary); font-weight: 600;">
                      Need help?
                    </a>
                  </div>
                  <div style="position: relative;">
                    <input
                      type="password"
                      name="password"
                      id="login-password"
                      class="form-control"
                      placeholder="Enter your password"
                      required
                    />
                    <button type="button" class="btn-toggle-pwd" data-target="login-password">👁️</button>
                  </div>
                </div>

                <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.25rem;">
                  <label style="display: flex; align-items: center; gap: 0.5rem; font-size: 0.8rem; color: var(--text-muted); cursor: pointer;">
                    <input type="checkbox" checked /> Remember me
                  </label>
                  <span style="font-size: 0.75rem; color: var(--text-muted);">
                    Don't have an account? <a href="javascript:void(0)" class="btn-switch-to-register" style="color: var(--primary); font-weight: 600;">Sign up</a>
                  </span>
                </div>

                <button type="submit" class="btn btn-primary btn-lg" style="width: 100%; font-weight: 700;">
                  Sign In to CRM
                </button>
              </form>
            ` : `
              <!-- REGISTER VIEW -->
              <form id="form-auth-register" class="auth-form">
                <div class="form-row">
                  <div class="form-group">
                    <label class="form-label required">Full Name</label>
                    <input
                      type="text"
                      name="name"
                      class="form-control"
                      placeholder="e.g. Maya Lin"
                      required
                    />
                  </div>
                  <div class="form-group">
                    <label class="form-label required">Company Name</label>
                    <input
                      type="text"
                      name="company"
                      class="form-control"
                      placeholder="e.g. Acme Sales Global"
                      value="Acme Sales Global"
                      required
                    />
                  </div>
                </div>

                <div class="form-group">
                  <label class="form-label required">Email Address</label>
                  <input
                    type="email"
                    name="email"
                    class="form-control"
                    placeholder="user@gmail.com"
                    required
                  />
                </div>

                <div class="form-row">
                  <div class="form-group">
                    <label class="form-label required">Sales Role / Title</label>
                    <select name="role" class="form-control">
                      <option value="Sales Representative">Sales Representative</option>
                      <option value="Senior Sales Lead">Senior Sales Lead</option>
                      <option value="Enterprise Account Executive">Enterprise Account Executive</option>
                      <option value="Business Development Rep">Business Development Rep (BDR)</option>
                      <option value="Sales Manager">Sales Manager</option>
                    </select>
                  </div>
                  <div class="form-group">
                    <label class="form-label required">Password</label>
                    <div style="position: relative;">
                      <input
                        type="password"
                        name="password"
                        id="reg-password"
                        class="form-control"
                        placeholder="At least 6 characters"
                        required
                        minlength="6"
                      />
                      <button type="button" class="btn-toggle-pwd" data-target="reg-password">👁️</button>
                    </div>
                  </div>
                </div>

                <div class="form-group" style="margin-top: 0.5rem;">
                  <label style="display: flex; align-items: center; gap: 0.5rem; font-size: 0.78rem; color: var(--text-muted); cursor: pointer;">
                    <input type="checkbox" required checked /> I agree to the CRM usage terms and Data Alcott privacy policy
                  </label>
                </div>

                <button type="submit" class="btn btn-primary btn-lg" style="width: 100%; font-weight: 700; margin-top: 0.75rem;">
                  Create Account & Launch CRM
                </button>
              </form>
            `}

          </div>

          <!-- Auth Footer -->
          <div class="auth-footer-text">
            Protected by Data Alcott Systems Secure CRM Authentication &bull; Task ID: <code>WD-CRM-002</code>
          </div>

        </div>
      </div>
    `;

    attachListeners();
  }

  function attachListeners() {
    // Tab switching
    container.querySelectorAll('.auth-tab-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        activeTab = e.currentTarget.dataset.tab;
        render();
      });
    });

    // Password Toggle Button
    container.querySelectorAll('.btn-toggle-pwd').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const targetId = e.currentTarget.dataset.target;
        const input = container.querySelector(`#${targetId}`);
        if (input) {
          input.type = input.type === 'password' ? 'text' : 'password';
        }
      });
    });

    // Login Form Submit
    const loginForm = container.querySelector('#form-auth-login');
    loginForm?.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = container.querySelector('#login-email').value;
      const pwd = container.querySelector('#login-password').value;

      try {
        const user = state.login(email, pwd);
        toast.success(`Welcome back, ${user.name}!`, `Logged in as ${user.role}.`);
        if (onLoginSuccess) onLoginSuccess(user);
      } catch (err) {
        toast.error('Sign In Failed', err.message);
      }
    });

    // Switch to register tab link
    container.querySelector('.btn-switch-to-register')?.addEventListener('click', () => {
      activeTab = 'register';
      render();
    });

    // Register Form Submit
    const regForm = container.querySelector('#form-auth-register');
    regForm?.addEventListener('submit', (e) => {
      e.preventDefault();
      const fd = new FormData(regForm);
      try {
        const newUser = state.register({
          name: fd.get('name'),
          company: fd.get('company'),
          email: fd.get('email'),
          role: fd.get('role'),
          password: fd.get('password')
        });
        toast.success(`Welcome to CRM, ${newUser.name}! 🎉`, `Account created as ${newUser.role}.`);
        if (onLoginSuccess) onLoginSuccess(newUser);
      } catch (err) {
        toast.error('Registration Failed', err.message);
      }
    });

    // Help Hint
    container.querySelector('#btn-forgot-password')?.addEventListener('click', () => {
      toast.info('Sign In Help', 'Please enter your registered email and password, or click "Create Account" above to register.');
    });
  }

  render();
}

/**
 * Inside-app Profile & Settings View
 */
export function renderUserManagementView(container, state) {
  const user = state.currentUser;
  const registeredUsers = state.getRegisteredUsers();

  function render() {
    container.innerHTML = `
      <div class="animate-fade-in" style="max-width: 800px; margin: 0 auto;">
        <!-- Header -->
        <div class="toolbar">
          <div>
            <h2 style="font-size: 1.4rem; font-weight: 800; color: var(--text-main);">User Profile & Preferences</h2>
            <p style="font-size: 0.82rem; color: var(--text-muted);">
              Manage account settings, active session profile, and credentials
            </p>
          </div>
          <div class="toolbar-group">
            <button class="btn btn-outline btn-danger" id="btn-logout-inside">
              🚪 Sign Out
            </button>
          </div>
        </div>

        <!-- Profile Card -->
        <div class="card" style="margin-bottom: 1.5rem;">
          <div style="display: flex; align-items: center; gap: 1.5rem; margin-bottom: 1.5rem; padding-bottom: 1.5rem; border-bottom: 1px solid var(--border-color); flex-wrap: wrap;">
            <div style="width: 72px; height: 72px; border-radius: 50%; background: linear-gradient(135deg, var(--primary), #3b82f6); color: white; display: flex; align-items: center; justify-content: center; font-size: 1.75rem; font-weight: 800; box-shadow: var(--shadow-md);">
              ${user.avatar || 'US'}
            </div>
            <div>
              <h3 style="font-size: 1.35rem; font-weight: 800; color: var(--text-main); margin-bottom: 0.25rem;">
                ${escapeHtml(user.name)}
              </h3>
              <div style="font-size: 0.85rem; color: var(--text-muted);">
                ${escapeHtml(user.email)} &bull; <strong style="color: var(--primary);">${escapeHtml(user.role)}</strong>
              </div>
              <div style="font-size: 0.78rem; color: var(--text-subtle); margin-top: 0.25rem;">
                ${escapeHtml(user.company)} &bull; ${escapeHtml(user.department)}
              </div>
            </div>
          </div>

          <!-- Edit Profile Form -->
          <form id="form-edit-profile">
            <div class="form-row">
              <div class="form-group">
                <label class="form-label required">Full Name</label>
                <input type="text" name="name" class="form-control" value="${escapeHtml(user.name)}" required />
              </div>
              <div class="form-group">
                <label class="form-label required">Email Address</label>
                <input type="email" name="email" class="form-control" value="${escapeHtml(user.email)}" required />
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Role / Title</label>
                <input type="text" name="role" class="form-control" value="${escapeHtml(user.role)}" />
              </div>
              <div class="form-group">
                <label class="form-label">Company</label>
                <input type="text" name="company" class="form-control" value="${escapeHtml(user.company)}" />
              </div>
            </div>

            <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 1.25rem; flex-wrap: wrap; gap: 0.75rem;">
              <button type="button" class="btn btn-outline btn-danger" id="btn-delete-current-account" style="font-size: 0.8rem;">
                🗑️ Delete My Account
              </button>
              <button type="submit" class="btn btn-primary">Save Profile Settings</button>
            </div>
          </form>
        </div>

        <!-- Reset System Data -->
        <div class="card" style="border-color: #fca5a5; background-color: rgba(239, 68, 68, 0.05);">
          <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 1rem;">
            <div>
              <div style="font-weight: 700; color: #dc2626; font-size: 0.95rem;">Reset My Workspace Leads</div>
              <div style="font-size: 0.8rem; color: var(--text-muted);">Restore sample pipeline leads and follow-up activities for your workspace.</div>
            </div>
            <button class="btn btn-sm btn-danger" id="btn-reset-crm-data">
              Reset Pipeline Data
            </button>
          </div>
        </div>
      </div>
    `;

    attachProfileListeners();
  }

  function attachProfileListeners() {
    const profileForm = container.querySelector('#form-edit-profile');
    profileForm?.addEventListener('submit', (e) => {
      e.preventDefault();
      const formData = new FormData(profileForm);
      state.updateUser({
        name: formData.get('name'),
        email: formData.get('email'),
        role: formData.get('role'),
        company: formData.get('company'),
        avatar: formData.get('name').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
      });
      toast.success('Profile Saved', 'User information updated.');
      window.CRMApp.updateSidebarUser();
      render();
    });

    // Delete current account
    container.querySelector('#btn-delete-current-account')?.addEventListener('click', () => {
      if (confirm(`Are you sure you want to delete your account (${user?.email})? All your data will be cleared and you will be signed out.`)) {
        state.deleteAccount(user.id);
        toast.info('Account Deleted', 'Your account has been deleted.');
        window.CRMApp.showAuthScreen();
      }
    });

    container.querySelector('#btn-logout-inside')?.addEventListener('click', () => {
      window.CRMApp.handleLogout();
    });

    container.querySelector('#btn-reset-crm-data')?.addEventListener('click', () => {
      if (confirm('Reset your CRM leads and activities back to initial sample state?')) {
        state.resetToDemoData();
        toast.success('Reset Complete', 'Loaded sample demo CRM leads and pipeline.');
        window.CRMApp.navigateTo('dashboard');
      }
    });
  }

  render();
}
