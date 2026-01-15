# 🤝 Contributing Guide

Thank you for considering contributing to the RTSP Livestream Overlay application!

## How to Contribute

### Reporting Bugs

If you find a bug, please open an issue with:

- **Clear title**: Describe the bug briefly
- **Description**: Detailed explanation of the issue
- **Steps to reproduce**: How to recreate the bug
- **Expected behavior**: What should happen
- **Actual behavior**: What actually happens
- **Environment**: OS, browser, versions
- **Screenshots**: If applicable
- **Logs**: Console errors or backend logs

### Suggesting Features

For feature requests, open an issue with:

- **Feature description**: What you want to add
- **Use case**: Why this feature is needed
- **Proposed solution**: How it could work
- **Alternatives**: Other approaches considered
- **Additional context**: Any other relevant info

### Pull Requests

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. **Make your changes**
4. **Test thoroughly**
5. **Commit with clear messages**
   ```bash
   git commit -m "Add: feature description"
   ```
6. **Push to your fork**
   ```bash
   git push origin feature/your-feature-name
   ```
7. **Open a Pull Request**

### Code Style

**Python (Backend)**:
- Follow PEP 8
- Use meaningful variable names
- Add docstrings to functions
- Keep functions focused and small

**JavaScript (Frontend)**:
- Use ES6+ syntax
- Follow React best practices
- Use functional components
- Add PropTypes or TypeScript

**General**:
- Write clear comments
- Keep code DRY (Don't Repeat Yourself)
- Handle errors gracefully
- Add appropriate logging

### Testing

Before submitting:

- [ ] Test locally with sample RTSP stream
- [ ] Test all CRUD operations
- [ ] Test drag and resize functionality
- [ ] Test persistence (refresh page)
- [ ] Check browser console for errors
- [ ] Check backend logs for errors
- [ ] Test on different browsers (if frontend changes)

### Documentation

Update documentation if you:

- Add new features
- Change API endpoints
- Modify configuration
- Update dependencies

### Commit Messages

Use clear, descriptive commit messages:

- `Add: new feature description`
- `Fix: bug description`
- `Update: what was updated`
- `Refactor: what was refactored`
- `Docs: documentation changes`
- `Style: formatting changes`
- `Test: test additions or changes`

### Areas for Contribution

**High Priority**:
- [ ] Add authentication system
- [ ] Implement WebSocket for real-time updates
- [ ] Add overlay animation effects
- [ ] Improve error handling
- [ ] Add comprehensive test suite

**Medium Priority**:
- [ ] Add overlay templates
- [ ] Implement keyboard shortcuts
- [ ] Add undo/redo functionality
- [ ] Improve mobile responsiveness
- [ ] Add dark/light theme toggle

**Low Priority**:
- [ ] Add more overlay types (shapes, charts)
- [ ] Implement overlay grouping
- [ ] Add export/import overlay configs
- [ ] Create admin dashboard
- [ ] Add analytics tracking

### Development Setup

1. **Clone your fork**
   ```bash
   git clone https://github.com/your-username/rtsp-overlay-app.git
   cd rtsp-overlay-app
   ```

2. **Setup backend**
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # or venv\Scripts\activate on Windows
   pip install -r requirements.txt
   cp .env.example .env
   ```

3. **Setup frontend**
   ```bash
   cd frontend
   npm install
   ```

4. **Start MongoDB**
   ```bash
   mongod
   ```

5. **Run backend**
   ```bash
   cd backend
   python app.py
   ```

6. **Run frontend**
   ```bash
   cd frontend
   npm start
   ```

### Code Review Process

1. Maintainer reviews PR
2. Feedback provided if needed
3. Changes requested or approved
4. PR merged into main branch

### Questions?

Feel free to:
- Open an issue for questions
- Join discussions
- Ask for clarification

### Code of Conduct

- Be respectful and inclusive
- Welcome newcomers
- Focus on constructive feedback
- Help others learn and grow

### License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

**Thank you for contributing! 🎉**
