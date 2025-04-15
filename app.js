
const menuToggle = document.querySelector('.menu-toggle');
const navLinks = document.querySelector('.nav-links');
const authLinks = document.querySelectorAll('.auth-links');
const loginLink = document.getElementById('login-link');
const signupLink = document.getElementById('signup-link');
const dashboardLink = document.getElementById('dashboard-link');
const logoutLink = document.getElementById('logout-link');


let currentUser = null;
let posts = JSON.parse(localStorage.getItem('posts')) || [];
let comments = JSON.parse(localStorage.getItem('comments')) || [];
let users = JSON.parse(localStorage.getItem('users')) || [];


function init() {
    setupEventListeners();
    checkAuthStatus();
    
    
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    
    switch(currentPage) {
        case 'index.html':
            displayFeaturedPosts();
            break;
        case 'explore.html':
            displayAllPosts();
            break;
        case 'post.html':
            const postId = new URLSearchParams(window.location.search).get('id');
            if (postId) displayPost(postId);
            break;
        case 'dashboard.html':
            protectRoute();
            loadDashboard();
            break;
        case 'create-post.html':
        case 'edit-post.html':
            protectRoute();
            setupEditor();
            const editId = new URLSearchParams(window.location.search).get('id');
            if (editId && currentPage === 'edit-post.html') loadPostForEditing(editId);
            break;
        case 'profile.html':
            const userId = new URLSearchParams(window.location.search).get('id');
            if (userId) loadUserProfile(userId);
            break;
        case 'settings.html':
            protectRoute();
            loadUserSettings();
            break;
    }
}


function setupEventListeners() {
    
    if (menuToggle) {
        menuToggle.addEventListener('click', () => {
            navLinks.classList.toggle('active');
        });
    }
    
   
    if (logoutLink) {
        logoutLink.addEventListener('click', (e) => {
            e.preventDefault();
            logout();
        });
    }
    
    
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    const signupForm = document.getElementById('signup-form');
    if (signupForm) {
        signupForm.addEventListener('submit', handleSignup);
    }
    
    const postForm = document.getElementById('post-form');
    if (postForm) {
        postForm.addEventListener('submit', handlePostSubmit);
    }
    
    const commentForm = document.getElementById('comment-form');
    if (commentForm) {
        commentForm.addEventListener('submit', handleCommentSubmit);
    }
    
    const settingsForm = document.getElementById('settings-form');
    if (settingsForm) {
        settingsForm.addEventListener('submit', handleSettingsSubmit);
    }
    
    
    const profileTabs = document.querySelectorAll('.profile-tab');
    profileTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const target = tab.getAttribute('data-tab');
            
            
            profileTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            
            document.querySelectorAll('.tab-content').forEach(content => {
                content.classList.remove('active');
            });
            document.getElementById(target).classList.add('active');
        });
    });
    
    const settingsTabs = document.querySelectorAll('.settings-menu-item');
    settingsTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const target = tab.getAttribute('data-section');
            
            
            settingsTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            
            document.querySelectorAll('.settings-section').forEach(content => {
                content.style.display = 'none';
            });
            document.getElementById(target).style.display = 'block';
        });
    });
}

// Authentication Functions
function checkAuthStatus() {
    const storedUser = localStorage.getItem('currentUser');
    
    if (storedUser) {
        currentUser = JSON.parse(storedUser);
        updateAuthUI(true);
    } else {
        updateAuthUI(false);
    }
}

function updateAuthUI(isLoggedIn) {
    if (loginLink && signupLink && dashboardLink && logoutLink) {
        if (isLoggedIn) {
            loginLink.classList.add('hidden');
            signupLink.classList.add('hidden');
            dashboardLink.classList.remove('hidden');
            logoutLink.classList.remove('hidden');
        } else {
            loginLink.classList.remove('hidden');
            signupLink.classList.remove('hidden');
            dashboardLink.classList.add('hidden');
            logoutLink.classList.add('hidden');
        }
    }
}

function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    const user = users.find(u => u.email === email && u.password === password);
    
    if (user) {
        // Create a copy without the password for security
        const userForStorage = { ...user };
        delete userForStorage.password;
        
        localStorage.setItem('currentUser', JSON.stringify(userForStorage));
        currentUser = userForStorage;
        
        showNotification('Login successful', 'success');
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 1000);
    } else {
        showNotification('Invalid email or password', 'error');
    }
}

function handleSignup(e) {
    e.preventDefault();
    
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirm-password').value;
    
    if (password !== confirmPassword) {
        showNotification('Passwords do not match', 'error');
        return;
    }
    
    if (users.some(u => u.email === email)) {
        showNotification('Email already in use', 'error');
        return;
    }
    
    const newUser = {
        id: generateId(),
        name,
        email,
        password,
        bio: '',
        avatar: '',
        createdAt: new Date().toISOString(),
        postsCount: 0,
        followersCount: 0,
        followingCount: 0
    };
    
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    
    // Log in the new user automatically
    const userForStorage = { ...newUser };
    delete userForStorage.password;
    
    localStorage.setItem('currentUser', JSON.stringify(userForStorage));
    currentUser = userForStorage;
    
    showNotification('Account created successfully', 'success');
    setTimeout(() => {
        window.location.href = 'dashboard.html';
    }, 1000);
}

function logout() {
    localStorage.removeItem('currentUser');
    currentUser = null;
    updateAuthUI(false);
    showNotification('Logged out successfully', 'info');
    
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 1000);
}

function protectRoute() {
    if (!currentUser) {
        showNotification('Please log in to access this page', 'error');
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 1000);
    }
}

// Post Functions
function displayFeaturedPosts() {
    const container = document.getElementById('featured-posts-container');
    if (!container) return;
    
    // Clear default posts if we have real ones
    if (posts.length > 0) {
        container.innerHTML = '';
        
        // Get the 3 most recent posts for the featured section
        const featuredPosts = [...posts].sort((a, b) => 
            new Date(b.createdAt) - new Date(a.createdAt)
        ).slice(0, 3);
        
        featuredPosts.forEach(post => {
            const author = users.find(user => user.id === post.authorId) || { name: 'Unknown' };
            
            container.innerHTML += `
                <div class="post-card">
                    <div class="post-img placeholder"></div>
                    <div class="post-content">
                        <h3>${post.title}</h3>
                        <p class="post-excerpt">${post.content.substring(0, 120)}...</p>
                        <div class="post-meta">
                            <span class="author">${author.name}</span>
                            <span class="date">${formatDate(post.createdAt)}</span>
                        </div>
                        <a href="post.html?id=${post.id}" class="read-more">Read More</a>
                    </div>
                </div>
            `;
        });
    }
}

function displayAllPosts() {
    const container = document.getElementById('all-posts-container');
    if (!container) return;
    
    if (posts.length === 0) {
        container.innerHTML = '<p class="text-center">No posts available yet. Be the first to create a post!</p>';
        return;
    }
    
    container.innerHTML = '';
    
    // Sort posts by date (newest first)
    const sortedPosts = [...posts].sort((a, b) => 
        new Date(b.createdAt) - new Date(a.createdAt)
    );
    
    sortedPosts.forEach(post => {
        const author = users.find(user => user.id === post.authorId) || { name: 'Unknown' };
        
        container.innerHTML += `
            <div class="post-card">
                <div class="post-img placeholder"></div>
                <div class="post-content">
                    <h3>${post.title}</h3>
                    <p class="post-excerpt">${post.content.substring(0, 120)}...</p>
                    <div class="post-meta">
                        <span class="author">${author.name}</span>
                        <span class="date">${formatDate(post.createdAt)}</span>
                    </div>
                    <a href="post.html?id=${post.id}" class="read-more">Read More</a>
                </div>
            </div>
        `;
    });
}

function displayPost(postId) {
    const post = posts.find(p => p.id === postId);
    if (!post) {
        showNotification('Post not found', 'error');
        setTimeout(() => {
            window.location.href = 'explore.html';
        }, 1000);
        return;
    }
    
    const author = users.find(user => user.id === post.authorId) || { name: 'Unknown' };
    
    // Update the DOM with post details
    document.getElementById('post-title').textContent = post.title;
    document.getElementById('post-author').textContent = author.name;
    document.getElementById('post-date').textContent = formatDate(post.createdAt);
    document.getElementById('post-content').innerHTML = post.content;
    
    // Show edit and delete buttons to post author
    const postActions = document.getElementById('post-actions');
    if (postActions && currentUser && currentUser.id === post.authorId) {
        postActions.innerHTML = `
            <a href="edit-post.html?id=${post.id}" class="btn btn-secondary">Edit Post</a>
            <button class="btn btn-secondary delete-post" data-id="${post.id}">Delete Post</button>
        `;
        
        // Add event listener for delete button
        document.querySelector('.delete-post').addEventListener('click', () => {
            if (confirm('Are you sure you want to delete this post?')) {
                deletePost(post.id);
            }
        });
    }
    
    // Load comments
    loadComments(postId);
}

function handlePostSubmit(e) {
    e.preventDefault();
    
    if (!currentUser) {
        showNotification('Please log in to create a post', 'error');
        return;
    }
    
    const title = document.getElementById('post-title').value;
    const content = document.getElementById('post-content').value;
    const postId = document.getElementById('post-id')?.value;
    
    if (!title || !content) {
        showNotification('Please fill in all fields', 'error');
        return;
    }
    
    // Check if we're editing or creating
    if (postId) {
        // Editing existing post
        const postIndex = posts.findIndex(p => p.id === postId);
        if (postIndex !== -1) {
            posts[postIndex].title = title;
            posts[postIndex].content = content;
            posts[postIndex].updatedAt = new Date().toISOString();
            
            localStorage.setItem('posts', JSON.stringify(posts));
            showNotification('Post updated successfully', 'success');
            
            setTimeout(() => {
                window.location.href = 'post.html?id=' + postId;
            }, 1000);
        }
    } else {
        // Creating new post
        const newPost = {
            id: generateId(),
            title,
            content,
            authorId: currentUser.id,
            createdAt: new Date().toISOString(),
            updatedAt: null
        };
        
        posts.push(newPost);
        localStorage.setItem('posts', JSON.stringify(posts));
        
        // Update post count for user
        const userIndex = users.findIndex(u => u.id === currentUser.id);
        if (userIndex !== -1) {
            users[userIndex].postsCount++;
            localStorage.setItem('users', JSON.stringify(users));
        }
        
        showNotification('Post created successfully', 'success');
        setTimeout(() => {
            window.location.href = 'post.html?id=' + newPost.id;
        }, 1000);
    }
}

function deletePost(postId) {
    // Remove the post
    posts = posts.filter(p => p.id !== postId);
    localStorage.setItem('posts', JSON.stringify(posts));
    
    // Remove associated comments
    comments = comments.filter(c => c.postId !== postId);
    localStorage.setItem('comments', JSON.stringify(comments));
    
    // Decrement user's post count
    const userIndex = users.findIndex(u => u.id === currentUser.id);
    if (userIndex !== -1) {
        users[userIndex].postsCount = Math.max(0, users[userIndex].postsCount - 1);
        localStorage.setItem('users', JSON.stringify(users));
    }
    
    showNotification('Post deleted successfully', 'info');
    setTimeout(() => {
        window.location.href = 'dashboard.html';
    }, 1000);
}

function loadPostForEditing(postId) {
    const post = posts.find(p => p.id === postId);
    
    if (!post) {
        showNotification('Post not found', 'error');
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 1000);
        return;
    }
    
    // Make sure only the author can edit
    if (currentUser.id !== post.authorId) {
        showNotification('You are not authorized to edit this post', 'error');
        setTimeout(() => {
            window.location.href = 'post.html?id=' + postId;
        }, 1000);
        return;
    }
    
    // Populate the form
    document.getElementById('post-title').value = post.title;
    document.getElementById('post-content').value = post.content;
    
    // Add hidden field for post ID
    const form = document.getElementById('post-form');
    const hiddenField = document.createElement('input');
    hiddenField.type = 'hidden';
    hiddenField.id = 'post-id';
    hiddenField.value = postId;
    form.appendChild(hiddenField);
}

// Comment Functions
function loadComments(postId) {
    const commentsContainer = document.getElementById('comments-list');
    if (!commentsContainer) return;
    
    const postComments = comments.filter(c => c.postId === postId);
    
    if (postComments.length === 0) {
        commentsContainer.innerHTML = '<p>No comments yet. Be the first to comment!</p>';
        return;
    }
    
    commentsContainer.innerHTML = '';
    
    // Sort comments newest first
    const sortedComments = [...postComments].sort((a, b) => 
        new Date(b.createdAt) - new Date(a.createdAt)
    );
    
    sortedComments.forEach(comment => {
        const author = users.find(user => user.id === comment.authorId) || { name: 'Unknown' };
        
        commentsContainer.innerHTML += `
            <div class="comment-card">
                <div class="comment-header">
                    <span class="comment-author">${author.name}</span>
                    <span class="comment-date">${formatDate(comment.createdAt)}</span>
                </div>
                <div class="comment-body">
                    <p>${comment.content}</p>
                </div>
                ${currentUser && (currentUser.id === comment.authorId) ? 
                    `<div class="comment-actions">
                        <button class="delete-comment" data-id="${comment.id}">Delete</button>
                    </div>` : ''}
            </div>
        `;
    });
    
    // Add event listeners for delete buttons
    document.querySelectorAll('.delete-comment').forEach(button => {
        button.addEventListener('click', () => {
            const commentId = button.getAttribute('data-id');
            if (confirm('Are you sure you want to delete this comment?')) {
                deleteComment(commentId);
            }
        });
    });
}

function handleCommentSubmit(e) {
    e.preventDefault();
    
    if (!currentUser) {
        showNotification('Please log in to comment', 'error');
        return;
    }
    
    const content = document.getElementById('comment-content').value;
    const postId = new URLSearchParams(window.location.search).get('id');
    
    if (!content) {
        showNotification('Please enter a comment', 'error');
        return;
    }
    
    const newComment = {
        id: generateId(),
        content,
        authorId: currentUser.id,
        postId,
        createdAt: new Date().toISOString()
    };
    
    comments.push(newComment);
    localStorage.setItem('comments', JSON.stringify(comments));
    
    showNotification('Comment added successfully', 'success');
    document.getElementById('comment-content').value = '';
    
    // Reload comments
    loadComments(postId);
}

function deleteComment(commentId) {
    comments = comments.filter(c => c.id !== commentId);
    localStorage.setItem('comments', JSON.stringify(comments));
    
    const postId = new URLSearchParams(window.location.search).get('id');
    showNotification('Comment deleted successfully', 'info');
    
    // Reload comments
    loadComments(postId);
}

// Dashboard Functions
function loadDashboard() {
    if (!currentUser) return;
    
    document.getElementById('welcome-message').textContent = `Welcome, ${currentUser.name}!`;
    
    // Load user's posts
    const userPosts = posts.filter(post => post.authorId === currentUser.id);
    const postsTable = document.getElementById('user-posts');
    
    if (userPosts.length === 0) {
        postsTable.innerHTML = '<tr><td colspan="4" class="text-center">You haven\'t created any posts yet.</td></tr>';
        return;
    }
    
    // Sort posts by date (newest first)
    const sortedPosts = [...userPosts].sort((a, b) => 
        new Date(b.createdAt) - new Date(a.createdAt)
    );
    
    sortedPosts.forEach(post => {
        const commentsCount = comments.filter(c => c.postId === post.id).length;
        
        postsTable.innerHTML += `
            <tr>
                <td>${post.title}</td>
                <td>${formatDate(post.createdAt)}</td>
                <td>${commentsCount}</td>
                <td>
                    <a href="post.html?id=${post.id}" class="action-btn view-btn">View</a>
                    <a href="edit-post.html?id=${post.id}" class="action-btn edit-btn">Edit</a>
                    <button class="action-btn delete-btn" data-id="${post.id}">Delete</button>
                </td>
            </tr>
        `;
    });
    
    // Update dashboard stats
    document.getElementById('posts-count').textContent = userPosts.length;
    
    // Calculate total comments on user's posts
    let totalComments = 0;
    userPosts.forEach(post => {
        totalComments += comments.filter(c => c.postId === post.id).length;
    });
    document.getElementById('comments-count').textContent = totalComments;
    
    // Add event listeners for delete buttons
    document.querySelectorAll('.delete-btn').forEach(button => {
        button.addEventListener('click', () => {
            const postId = button.getAttribute('data-id');
            if (confirm('Are you sure you want to delete this post?')) {
                deletePost(postId);
            }
        });
    });
}

// User Profile and Settings
function loadUserProfile(userId) {
    const user = users.find(u => u.id === userId);
    if (!user) {
        showNotification('User not found', 'error');
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1000);
        return;
    }
    
    document.getElementById('profile-name').textContent = user.name;
    document.getElementById('profile-bio').textContent = user.bio || 'No bio yet.';
    document.getElementById('posts-stat').textContent = user.postsCount || 0;
    document.getElementById('followers-stat').textContent = user.followersCount || 0;
    document.getElementById('following-stat').textContent = user.followingCount || 0;
    
    // Load user's posts
    const userPosts = posts.filter(post => post.authorId === userId);
    const postsContainer = document.getElementById('posts-tab');
    
    if (userPosts.length === 0) {
        postsContainer.innerHTML = '<p class="text-center">No posts yet.</p>';
    } else {
        postsContainer.innerHTML = '<div class="posts-grid"></div>';
        const grid = postsContainer.querySelector('.posts-grid');
        
        userPosts.forEach(post => {
            grid.innerHTML += `
                <div class="post-card">
                    <div class="post-img placeholder"></div>
                    <div class="post-content">
                        <h3>${post.title}</h3>
                        <p class="post-excerpt">${post.content.substring(0, 120)}...</p>
                        <div class="post-meta">
                            <span class="date">${formatDate(post.createdAt)}</span>
                        </div>
                        <a href="post.html?id=${post.id}" class="read-more">Read More</a>
                    </div>
                </div>
            `;
        });
    }
}

function loadUserSettings() {
    if (!currentUser) return;
    
    // Load user info into form
    document.getElementById('name').value = currentUser.name;
    document.getElementById('email').value = currentUser.email;
    document.getElementById('bio').value = currentUser.bio || '';
}

function handleSettingsSubmit(e) {
    e.preventDefault();
    
    if (!currentUser) return;
    
    const name = document.getElementById('name').value;
    const bio = document.getElementById('bio').value;
    const currentPassword = document.getElementById('current-password').value;
    const newPassword = document.getElementById('new-password').value;
    const confirmPassword = document.getElementById('confirm-password').value;
    
    // Find user in storage
    const userIndex = users.findIndex(u => u.id === currentUser.id);
    if (userIndex === -1) {
        showNotification('User not found', 'error');
        return;
    }
    
    // Update basic info
    users[userIndex].name = name;
    users[userIndex].bio = bio;
    
    // Update password if provided
    if (newPassword) {
        if (newPassword !== confirmPassword) {
            showNotification('New passwords do not match', 'error');
            return;
        }
        
        // Verify current password
        if (users[userIndex].password !== currentPassword) {
            showNotification('Current password is incorrect', 'error');
            return;
        }
        
        users[userIndex].password = newPassword;
    }
    
    // Save changes
    localStorage.setItem('users', JSON.stringify(users));
    
    // Update current user
    const updatedUser = { ...users[userIndex] };
    delete updatedUser.password;
    localStorage.setItem('currentUser', JSON.stringify(updatedUser));
    currentUser = updatedUser;
    
    showNotification('Settings updated successfully', 'success');
}

// Editor Functions
function setupEditor() {
    const toolbarButtons = document.querySelectorAll('.toolbar-btn');
    const contentArea = document.getElementById('post-content');
    
    if (!toolbarButtons.length || !contentArea) return;
    
    toolbarButtons.forEach(button => {
        button.addEventListener('click', () => {
            const command = button.getAttribute('data-command');
            const value = button.getAttribute('data-value') || null;
            
            if (command === 'createLink') {
                const url = prompt('Enter the link URL:');
                if (url) document.execCommand(command, false, url);
            } else if (command === 'insertImage') {
                const url = prompt('Enter the image URL:');
                if (url) document.execCommand(command, false, url);
            } else {
                document.execCommand(command, false, value);
            }
            
            contentArea.focus();
        });
    });
}

// Utility Functions
function generateId() {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
    });
}

function showNotification(message, type) {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notif => {
        notif.remove();
    });
    
  
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <span class="notification-icon">
            ${type === 'success' ? '<i class="fas fa-check-circle"></i>' : ''}
            ${type === 'error' ? '<i class="fas fa-exclamation-circle"></i>' : ''}
            ${type === 'info' ? '<i class="fas fa-info-circle"></i>' : ''}
        </span>
        <span class="notification-message">${message}</span>
        <button class="notification-close">&times;</button>
    `;
    
    document.body.appendChild(notification);
    
   
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
   
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 5000);
    
   
    notification.querySelector('.notification-close').addEventListener('click', () => {
        notification.classList.remove('show');
        setTimeout(() => {
            notification.remove();
        }, 300);
    });
}


document.addEventListener('DOMContentLoaded', init);
