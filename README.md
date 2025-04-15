# BlogVerse

BlogVerse is a dynamic blogging platform where users can express themselves, share stories, and connect with readers worldwide. This platform allows users to create, edit, and delete blog posts, interact through comments, and enjoy a responsive design optimized for all devices.

![image](https://github.com/user-attachments/assets/b8d22b60-7580-48bd-8508-32b022f73021)
![image](https://github.com/user-attachments/assets/f6612385-463f-4029-87f6-fdd67145ed0e)



## Table of Contents

- [Features](#features)
- [Technologies](#technologies)
- [Installation](#installation)
- [Usage](#usage)
- [Project Structure](#project-structure)
- [API Documentation](#api-documentation)
- [Authentication](#authentication)
- [Contributing](#contributing)
- [License](#license)
- [Contact](#contact)

## Features

### Core Features
- **User Authentication** - Secure signup, login, and account management
- **Blog Creation** - User-friendly editor for creating and publishing posts
- **Content Management** - Edit and delete your own posts
- **Interactive Comments** - Engage with readers through dynamic comment sections
- **Responsive Design** - Optimized for desktop, tablet, and mobile devices

### Additional Features
- **Featured Posts** - Highlight outstanding content on the homepage
- **User Profiles** - Customize your author profile
- **Social Sharing** - Easily share posts across social media platforms
- **Search Functionality** - Find content by keywords, authors, or categories
- **Dashboard** - Personal space to manage all your content

## Technologies

### Frontend
- HTML5
- CSS3
- JavaScript
- Font Awesome (for icons)

### Backend
- Node.js
- Express.js
- MongoDB (database)
- JWT (for authentication)

### Tools & Utilities
- Git (version control)
- NPM (package management)

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/TRIDENT11107/blogverse.git
   cd blogverse
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   - Create a `.env` file in the root directory
   - Add the following variables:
     ```
     PORT=3000
     MONGODB_URI=your_mongodb_connection_string
     JWT_SECRET=your_jwt_secret
     ```

4. Start development server:
   ```bash
   npm run dev
   ```

## Usage

### For Readers
1. Browse the homepage to see featured posts
2. Explore posts by category or use the search function
3. Read posts and leave comments
4. Sign up to engage more deeply with the community

### For Writers
1. Create an account or log in
2. Access your dashboard to manage your content
3. Create new posts using the rich text editor
4. Respond to comments on your posts
5. Edit or delete your posts as needed

## Project Structure

```
blogverse/
├── public/
│   ├── css/
│   │   └── styles.css
│   ├── js/
│   │   └── app.js
│   └── images/
├── views/
│   ├── index.html
│   ├── explore.html
│   ├── about.html
│   ├── contact.html
│   ├── login.html
│   ├── signup.html
│   └── dashboard.html
├── server/
│   ├── models/
│   ├── controllers/
│   ├── routes/
│   ├── middleware/
│   └── config/
├── .env
├── .gitignore
├── package.json
├── README.md
└── app.js
```

## API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login and receive JWT token
- `GET /api/auth/user` - Get current user info

### Blog Post Endpoints
- `GET /api/posts` - Get all posts
- `GET /api/posts/:id` - Get a specific post
- `POST /api/posts` - Create a new post (Auth required)
- `PUT /api/posts/:id` - Update a post (Auth required)
- `DELETE /api/posts/:id` - Delete a post (Auth required)

### Comment Endpoints
- `GET /api/posts/:id/comments` - Get all comments for a post
- `POST /api/posts/:id/comments` - Add a comment (Auth required)
- `DELETE /api/comments/:id` - Delete a comment (Auth required)

## Authentication

BlogVerse uses JWT (JSON Web Tokens) for authentication. The authentication flow is as follows:

1. User registers or logs in
2. Server validates credentials and issues a JWT
3. Client stores the JWT (typically in localStorage)
4. JWT is sent with subsequent requests in the Authorization header
5. Protected routes verify the JWT before processing requests

## Contributing

1. Fork the repository
2. Create a new branch: `git checkout -b feature/your-feature-name`
3. Make your changes and commit them: `git commit -m 'Add some feature'`
4. Push to the branch: `git push origin feature/your-feature-name`
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Contact

- Email: rastogisarthak84@gmail.com
- Phone: +91 9311206668
- GitHub: [Your GitHub Profile](https://github.com/TRIDENT11107)
