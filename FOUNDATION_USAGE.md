# Using Foundation for Sites with Bootstrap

This document explains how to use Foundation for Sites alongside Bootstrap in this project.

## Overview

- **Bootstrap**: Used for most of the application (grid, utilities, base components)
- **Foundation**: Used selectively for specific features/components
- **PrimeReact**: Used for advanced components (DataTable, Dialog, Toast, etc.)

## Approach: Scoped CSS

To avoid CSS conflicts between Bootstrap and Foundation, we use **scoped CSS** with the `.foundation-scope` class.

## How to Use Foundation

### Method 1: Using FoundationWrapper Component

Wrap your Foundation components with the `FoundationWrapper` component:

```jsx
import FoundationWrapper from '../components/FoundationWrapper';

function MyComponent() {
  return (
    <div>
      {/* Bootstrap content */}
      <div className="container">
        <div className="row">
          <div className="col-md-6">
            <button className="btn btn-primary">Bootstrap Button</button>
          </div>
        </div>
      </div>

      {/* Foundation content */}
      <FoundationWrapper>
        <div className="grid-container">
          <div className="grid-x grid-margin-x">
            <div className="cell small-12 medium-6">
              <button className="button">Foundation Button</button>
            </div>
          </div>
        </div>
      </FoundationWrapper>
    </div>
  );
}
```

### Method 2: Manual Scoping

Add the `foundation-scope` class directly to your container:

```jsx
import '../styles/foundation-scoped.css';

function MyComponent() {
  return (
    <div className="foundation-scope">
      {/* All Foundation components go here */}
      <div className="grid-container">
        <div className="grid-x">
          <div className="cell">Foundation content</div>
        </div>
      </div>
    </div>
  );
}
```

## Available Foundation Components

### Grid System
```jsx
<FoundationWrapper>
  <div className="grid-container">
    <div className="grid-x grid-margin-x">
      <div className="cell small-12 medium-6 large-4">
        Content
      </div>
    </div>
  </div>
</FoundationWrapper>
```

### Buttons
```jsx
<FoundationWrapper>
  <button className="button">Default</button>
  <button className="button secondary">Secondary</button>
  <button className="button success">Success</button>
  <button className="button alert">Alert</button>
</FoundationWrapper>
```

### Cards
```jsx
<FoundationWrapper>
  <div className="card">
    <div className="card-divider">
      <h4>Card Title</h4>
    </div>
    <div className="card-section">
      <p>Card content</p>
    </div>
  </div>
</FoundationWrapper>
```

### Callouts
```jsx
<FoundationWrapper>
  <div className="callout primary">
    <h5>Primary Callout</h5>
    <p>Message here</p>
  </div>
  <div className="callout success">Success message</div>
  <div className="callout warning">Warning message</div>
  <div className="callout alert">Alert message</div>
</FoundationWrapper>
```

### Forms
```jsx
<FoundationWrapper>
  <form>
    <label>
      Name
      <input type="text" placeholder="Enter name" />
    </label>
    <label>
      Email
      <input type="email" placeholder="Enter email" />
    </label>
    <button type="submit" className="button">Submit</button>
  </form>
</FoundationWrapper>
```

## Best Practices

1. **Keep frameworks separate**: Don't mix Bootstrap and Foundation classes in the same element
2. **Use FoundationWrapper**: Always wrap Foundation components to avoid conflicts
3. **One framework per component**: Prefer using one framework per component/page section
4. **Document your choice**: Comment why you're using Foundation instead of Bootstrap for a specific feature

## When to Use Foundation vs Bootstrap

### Use Foundation when:
- You need Foundation's specific JavaScript plugins (Reveal, Orbit, etc.)
- You prefer Foundation's grid system for a particular layout
- You want Foundation's specific component styles
- You're migrating from Foundation and need to maintain some components

### Use Bootstrap when:
- Building new features (it's the primary framework)
- You need Bootstrap's utility classes
- You want consistency with the rest of the app

### Use PrimeReact when:
- You need advanced components (DataTable, Calendar, FileUpload)
- You want rich interactive components
- You need better form controls

## Example: Mixed Usage

```jsx
function PropertyListingPage() {
  return (
    <>
      {/* Bootstrap Navbar */}
      <Navbar /> {/* Uses Bootstrap */}
      
      {/* Bootstrap Container */}
      <div className="container">
        <div className="row">
          {/* Bootstrap Card */}
          <div className="col-md-8">
            <div className="card">
              <div className="card-body">
                <h5 className="card-title">Property Details</h5>
                <p className="card-text">Bootstrap content here</p>
              </div>
            </div>
          </div>
          
          {/* Foundation Sidebar */}
          <div className="col-md-4">
            <FoundationWrapper>
              <div className="callout primary">
                <h5>Quick Actions</h5>
                <button className="button">Foundation Button</button>
              </div>
            </FoundationWrapper>
          </div>
        </div>
      </div>
      
      {/* PrimeReact Dialog */}
      <Dialog visible={showDialog}>
        PrimeReact content
      </Dialog>
    </>
  );
}
```

## Troubleshooting

### CSS Conflicts
If you see styling issues:
1. Ensure Foundation components are wrapped in `.foundation-scope`
2. Check that Bootstrap classes aren't inside Foundation scopes
3. Use browser DevTools to inspect which styles are being applied

### JavaScript Plugins
Foundation's JavaScript plugins require jQuery. For React, consider:
- Using React alternatives (like PrimeReact components)
- Using Foundation's vanilla JS plugins (if available)
- Creating React wrappers for Foundation plugins

## See Also

- [Foundation Documentation](https://get.foundation/sites/docs/)
- [Bootstrap Documentation](https://getbootstrap.com/docs/5.3/)
- [PrimeReact Documentation](https://primereact.org/)

