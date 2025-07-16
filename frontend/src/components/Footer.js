import React from "react";

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-links">
          <a href="mailto:contact@descripto.ai" className="footer-link">
            Contact
          </a>
          <a href="https://github.com/your-username/descripto-ai" className="footer-link" target="_blank" rel="noopener noreferrer">
            GitHub
          </a>
          <a href="/privacy" className="footer-link">
            Privacy Policy
          </a>
        </div>
        <p className="footer-copyright">
          © 2024 Descripto AI. All rights reserved.
        </p>
      </div>
    </footer>
  );
}

export default Footer; 