# Contributing to AutomateLanka

Thank you for your interest in contributing to AutomateLanka! This document provides guidelines and information for contributors.

## 🚀 Getting Started

### Development Setup

1. **Fork the repository**
   ```bash
   git clone https://github.com/AsithaLKonara/AutomateLanka.git
   cd AutomateLanka
   ```

2. **Create a virtual environment**
   ```bash
   python3 -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Initialize the database**
   ```bash
   python3 run.py --reindex
   ```

5. **Start the development server**
   ```bash
   python3 run.py --dev
   ```

## 📝 How to Contribute

### Types of Contributions

- **Bug Reports** - Report issues and bugs
- **Feature Requests** - Suggest new features
- **Code Contributions** - Submit code improvements
- **Documentation** - Improve documentation
- **Testing** - Add or improve tests
- **Performance** - Optimize performance

### Contribution Process

1. **Create an Issue** (for bugs or feature requests)
2. **Fork the repository**
3. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
4. **Make your changes**
5. **Add tests** for new functionality
6. **Update documentation** if needed
7. **Commit your changes**
   ```bash
   git commit -m 'Add amazing feature'
   ```
8. **Push to your fork**
   ```bash
   git push origin feature/amazing-feature
   ```
9. **Create a Pull Request**

## 🎯 Coding Standards

### Python Code Style

- Follow **PEP 8** style guide
- Use **type hints** for function parameters and return values
- Write **comprehensive docstrings** for all functions and classes
- Keep functions **small and focused**
- Use **meaningful variable names**

Example:
```python
def search_workflows(
    query: str, 
    filters: Dict[str, Any] = None,
    limit: int = 20
) -> List[Dict[str, Any]]:
    """
    Search workflows using full-text search with optional filters.
    
    Args:
        query: Search query string
        filters: Optional filters to apply
        limit: Maximum number of results to return
        
    Returns:
        List of workflow dictionaries matching the search criteria
        
    Raises:
        ValueError: If query is empty or invalid
    """
    if not query.strip():
        raise ValueError("Query cannot be empty")
    
    # Implementation here
    pass
```

### JavaScript Code Style

- Use **ES6+** features
- Follow **consistent naming conventions**
- Add **JSDoc comments** for functions
- Use **async/await** for asynchronous operations

Example:
```javascript
/**
 * Fetch workflow recommendations for a user
 * @param {string} userId - User identifier
 * @param {number} limit - Maximum number of recommendations
 * @returns {Promise<Array>} Array of recommended workflows
 */
async function fetchRecommendations(userId, limit = 10) {
    try {
        const response = await fetch(`/api/recommendations/${userId}?limit=${limit}`);
        return await response.json();
    } catch (error) {
        console.error('Failed to fetch recommendations:', error);
        throw error;
    }
}
```

### Database Guidelines

- Use **descriptive table and column names**
- Add **appropriate indexes** for performance
- Include **foreign key constraints**
- Document **database schema changes**

### API Design

- Follow **RESTful principles**
- Use **consistent naming conventions**
- Include **proper HTTP status codes**
- Provide **comprehensive error responses**
- Document **all endpoints**

## 🧪 Testing

### Test Structure

```
tests/
├── unit/           # Unit tests
├── integration/    # Integration tests
├── e2e/           # End-to-end tests
└── fixtures/      # Test data
```

### Writing Tests

- Write **unit tests** for all new functions
- Include **integration tests** for API endpoints
- Test **error conditions** and edge cases
- Maintain **high test coverage** (>80%)

Example:
```python
import pytest
from fastapi.testclient import TestClient
from api_server import app

client = TestClient(app)

def test_search_workflows():
    """Test workflow search functionality."""
    response = client.get("/api/workflows?q=webhook")
    assert response.status_code == 200
    data = response.json()
    assert "workflows" in data
    assert len(data["workflows"]) > 0

def test_search_workflows_empty_query():
    """Test search with empty query."""
    response = client.get("/api/workflows?q=")
    assert response.status_code == 400
```

### Running Tests

```bash
# Run all tests
pytest

# Run with coverage
pytest --cov=.

# Run specific test file
pytest tests/test_api.py

# Run with verbose output
pytest -v
```

## 📚 Documentation

### Code Documentation

- **Docstrings** for all functions, classes, and modules
- **Type hints** for better code understanding
- **Inline comments** for complex logic
- **README updates** for new features

### API Documentation

- **FastAPI** automatically generates OpenAPI docs
- **Endpoint descriptions** and examples
- **Request/response schemas**
- **Error response documentation**

### User Documentation

- **README.md** updates for new features
- **Installation guides** and setup instructions
- **Usage examples** and tutorials
- **Troubleshooting guides**

## 🐛 Bug Reports

### Before Submitting

1. **Check existing issues** to avoid duplicates
2. **Test with the latest version**
3. **Gather relevant information**

### Bug Report Template

```markdown
**Bug Description**
A clear description of the bug.

**Steps to Reproduce**
1. Go to '...'
2. Click on '....'
3. Scroll down to '....'
4. See error

**Expected Behavior**
What you expected to happen.

**Actual Behavior**
What actually happened.

**Screenshots**
If applicable, add screenshots.

**Environment**
- OS: [e.g. macOS 13.0]
- Python Version: [e.g. 3.11.0]
- Browser: [e.g. Chrome 118.0]
- Version: [e.g. 1.0.0]

**Additional Context**
Any other context about the problem.
```

## ✨ Feature Requests

### Feature Request Template

```markdown
**Feature Description**
A clear description of the feature.

**Use Case**
Why is this feature needed?

**Proposed Solution**
How should this feature work?

**Alternatives Considered**
Other solutions you've considered.

**Additional Context**
Any other context about the feature request.
```

## 🔍 Code Review Process

### For Contributors

1. **Self-review** your code before submitting
2. **Test thoroughly** with different scenarios
3. **Update documentation** as needed
4. **Respond to feedback** promptly
5. **Keep commits focused** and atomic

### For Reviewers

1. **Review code quality** and style
2. **Check for security issues**
3. **Verify tests** are adequate
4. **Test functionality** manually
5. **Provide constructive feedback**

## 🚀 Release Process

### Version Numbering

We follow [Semantic Versioning](https://semver.org/):
- **MAJOR** version for incompatible API changes
- **MINOR** version for new functionality
- **PATCH** version for bug fixes

### Release Checklist

- [ ] All tests pass
- [ ] Documentation updated
- [ ] Version number updated
- [ ] Changelog updated
- [ ] Release notes prepared
- [ ] Tag created and pushed

## 🤝 Community Guidelines

### Code of Conduct

- **Be respectful** and inclusive
- **Be constructive** in feedback
- **Be patient** with new contributors
- **Be collaborative** and helpful

### Communication

- **GitHub Issues** for bug reports and feature requests
- **GitHub Discussions** for general questions and ideas
- **Pull Requests** for code contributions
- **GitHub Wiki** for documentation

## 📞 Getting Help

### Resources

- **Documentation:** [GitHub Wiki](https://github.com/AsithaLKonara/AutomateLanka/wiki)
- **Issues:** [GitHub Issues](https://github.com/AsithaLKonara/AutomateLanka/issues)
- **Discussions:** [GitHub Discussions](https://github.com/AsithaLKonara/AutomateLanka/discussions)

### Questions

If you have questions about contributing:
1. Check the **documentation** first
2. Search **existing issues** and discussions
3. Create a **new discussion** if needed
4. Tag **maintainers** for urgent issues

## 🎉 Recognition

Contributors will be recognized in:
- **README.md** contributors section
- **Release notes** for significant contributions
- **GitHub contributors** page
- **Project documentation**

Thank you for contributing to AutomateLanka! 🚀
