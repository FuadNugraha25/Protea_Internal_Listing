/**
 * FoundationExample Component
 * 
 * This component demonstrates how to use Foundation for Sites
 * alongside Bootstrap in the same application.
 * 
 * Usage: Wrap Foundation components in a div with class "foundation-scope"
 * to isolate Foundation styles from Bootstrap.
 */

import React, { useEffect } from 'react';
import '../styles/foundation-scoped.css';

const FoundationExample = () => {
  useEffect(() => {
    // Initialize Foundation JavaScript plugins if needed
    // Foundation requires jQuery, but we can use vanilla JS alternatives
    // For this example, we'll use CSS-only Foundation components
  }, []);

  return (
    <div className="foundation-scope" style={{ padding: '2rem' }}>
      <h2 style={{ marginBottom: '2rem' }}>Foundation Components Example</h2>
      
      {/* Foundation Grid System */}
      <div className="grid-container">
        <div className="grid-x grid-margin-x">
          <div className="cell small-12 medium-6 large-4">
            <div className="card">
              <div className="card-divider">
                <h4>Foundation Card</h4>
              </div>
              <div className="card-section">
                <p>This card uses Foundation's card component.</p>
                <button className="button">Foundation Button</button>
              </div>
            </div>
          </div>
          
          <div className="cell small-12 medium-6 large-4">
            <div className="callout primary">
              <h5>Primary Callout</h5>
              <p>This is a Foundation callout component.</p>
            </div>
          </div>
          
          <div className="cell small-12 medium-6 large-4">
            <div className="callout success">
              <h5>Success Callout</h5>
              <p>Foundation provides different callout styles.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Foundation Buttons */}
      <div style={{ marginTop: '2rem' }}>
        <h3>Foundation Buttons</h3>
        <button className="button">Default</button>
        <button className="button secondary">Secondary</button>
        <button className="button success">Success</button>
        <button className="button alert">Alert</button>
      </div>

      {/* Foundation Form Example */}
      <div style={{ marginTop: '2rem' }}>
        <h3>Foundation Form</h3>
        <form>
          <label>
            Name
            <input type="text" placeholder="Enter your name" />
          </label>
          <label>
            Email
            <input type="email" placeholder="Enter your email" />
          </label>
          <label>
            Message
            <textarea placeholder="Enter your message"></textarea>
          </label>
          <button type="submit" className="button">Submit</button>
        </form>
      </div>
    </div>
  );
};

export default FoundationExample;

