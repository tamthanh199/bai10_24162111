const tokenKey = 'bai10_jwt_token';

async function parseResponse(response) {
    const text = await response.text();
    let data = null;

    try {
        data = text ? JSON.parse(text) : null;
    } catch (_) {
        data = {
            message: text
        };
    }

    if (!response.ok) {
        throw new Error(
            data?.message ||
            data?.error ||
            `HTTP ${response.status}`
        );
    }

    return data;
}

async function signup(event) {
    event.preventDefault();

    const message = document.getElementById('signupMessage');

    if (message) {
        message.textContent = 'Đang tạo tài khoản...';
    }

    try {
        const response = await fetch('/auth/signup', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                fullName: document.getElementById('fullName').value,
                email: document.getElementById('signupEmail').value,
                password: document.getElementById('signupPassword').value
            })
        });

        const data = await parseResponse(response);

        if (message) {
            message.textContent =
                `Tạo tài khoản thành công: ${data.email}`;
        }

        const loginEmail =
            document.getElementById('loginEmail');

        if (loginEmail) {
            loginEmail.value = data.email;
        }

        const loginPassword =
            document.getElementById('loginPassword');

        if (loginPassword) {
            loginPassword.focus();
        }
    } catch (error) {
        if (message) {
            message.textContent =
                `Lỗi: ${error.message}`;
        }
    }
}

async function login(event) {
    event.preventDefault();

    const message =
        document.getElementById('loginMessage');

    if (message) {
        message.textContent = 'Đang đăng nhập...';
    }

    try {
        const response = await fetch('/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email:
                    document.getElementById('loginEmail').value,
                password:
                    document.getElementById('loginPassword').value
            })
        });

        const data = await parseResponse(response);

        localStorage.setItem(
            tokenKey,
            data.token
        );

        if (message) {
            message.textContent =
                'Đăng nhập thành công. Đang chuyển sang profile...';
        }

        window.location.href = '/profile';
    } catch (error) {
        if (message) {
            message.textContent =
                `Lỗi: ${error.message}`;
        }
    }
}

async function apiGet(url) {
    const token =
        localStorage.getItem(tokenKey);

    if (!token) {
        window.location.href = '/login';

        throw new Error(
            'Không tìm thấy JWT. Vui lòng đăng nhập lại.'
        );
    }

    const response = await fetch(url, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
        }
    });

    if (response.status === 401) {
        localStorage.removeItem(tokenKey);

        window.location.href = '/login';

        throw new Error(
            'JWT đã hết hạn hoặc không hợp lệ.'
        );
    }

    if (response.status === 403) {
        throw new Error(
            'Bạn không có quyền truy cập tài nguyên này.'
        );
    }

    return parseResponse(response);
}

function renderCurrentUser(user) {
    const profileImage =
        document.getElementById('profileImage');

    const profileFullName =
        document.getElementById('profileFullName');

    const profileEmail =
        document.getElementById('profileEmail');

    const profileRole =
        document.getElementById('profileRole');

    if (profileFullName) {
        profileFullName.textContent =
            user.fullName || '';
    }

    if (profileEmail) {
        profileEmail.textContent =
            user.email || '';
    }

    if (profileRole) {
        profileRole.textContent =
            user.role || '';
    }

    if (profileImage) {
        profileImage.src =
            user.images &&
            user.images.trim() !== ''
                ? user.images
                : '/images/default-avatar.png';

        profileImage.onerror = () => {
            profileImage.onerror = null;
            profileImage.src =
                '/images/default-avatar.png';
        };
    }
}

function renderUsers(users) {
    const usersTableBody =
        document.getElementById('usersTableBody');

    if (!usersTableBody) {
        return;
    }

    const rows = users.map(user => {
        const row =
            document.createElement('tr');

        const values = [
            user.id,
            user.fullName,
            user.email,
            user.role
        ];

        for (const value of values) {
            const cell =
                document.createElement('td');

            cell.textContent =
                value ?? '';

            row.appendChild(cell);
        }

        return row;
    });

    usersTableBody.replaceChildren(...rows);
}

async function loadProfile() {
    const meOutput =
        document.getElementById('meOutput');

    const usersTableBody =
        document.getElementById('usersTableBody');

    if (meOutput) {
        meOutput.textContent =
            'Đang tải thông tin người dùng...';
    }

    try {
        const me =
            await apiGet('/users/me');

        renderCurrentUser(me);

        if (meOutput) {
            meOutput.textContent =
                JSON.stringify(
                    me,
                    null,
                    2
                );
        }

        const users =
            await apiGet('/users');

        renderUsers(users);
    } catch (error) {
        if (meOutput) {
            meOutput.textContent =
                error.message;
        }

        if (usersTableBody) {
            usersTableBody.replaceChildren();
        }
    }
}

function logout() {
    localStorage.removeItem(tokenKey);
    window.location.href = '/login';
}

document.addEventListener(
    'DOMContentLoaded',
    () => {
        const signupForm =
            document.getElementById('signupForm');

        const loginForm =
            document.getElementById('loginForm');

        const profilePage =
            document.getElementById('profilePage');

        const logoutButton =
            document.getElementById('logoutButton');

        const reloadButton =
            document.getElementById('reloadButton');

        if (signupForm) {
            signupForm.addEventListener(
                'submit',
                signup
            );
        }

        if (loginForm) {
            loginForm.addEventListener(
                'submit',
                login
            );
        }

        if (profilePage) {
            loadProfile();
        }

        if (reloadButton) {
            reloadButton.addEventListener(
                'click',
                loadProfile
            );
        }

        if (logoutButton) {
            logoutButton.addEventListener(
                'click',
                logout
            );
        }
    }
);