/* eslint-disable react/prop-types */
import "./SupportCard.css";
import { X } from "lucide-react";

export default function SupportCard({ onClose }) {

  return (
    <div className="overlay">
      <div className="support-card-container">
        <div className="support-card-header">
          <div className="support-card-title">BioKey Help & Terms</div>
          <X
            style={{
              cursor: "pointer",
            }}
            onClick={onClose}
          />
        </div>
        <div className="support-card-content">
          <p className="support-card-text">
            Welcome to BioKey Support. Whether you&apos;re new or a long-time user,
            we&apos;re here to make your experience seamless and secure.
          </p>
          <div className="support-card-section">
            <div className="support-card-subtitle">📝 Terms of Service</div>
            <p className="support-card-text">
              By using BioKey, you agree to our terms. Your biometric data is
              stored securely on your device and is never shared without
              consent. Always ensure you&apos;re using the official BioKey hardware
              and software for optimal security and performance.
            </p>
          </div>
          <div className="support-card-section">
            <div className="support-card-subtitle">🔐 Data & Privacy</div>
            <p className="support-card-text">
              We value your privacy. Fingerprint data is encrypted and stored
              locally. We only use anonymized data to improve the app and never
              sell user data.
            </p>
          </div>
          <div className="support-card-section">
            <div className="support-card-subtitle">📞 Need Help?</div>
            <p className="support-card-text">
              If you&apos;re having trouble with registration, login, or device
              detection, visit our{" "}
              <a
                href="https://biokey.support"
                target="_blank"
                rel="noopener noreferrer"
              >
                Support Portal
              </a>{" "}
              for step-by-step assistance.
            </p>
          </div>
          <div className="support-card-section">
            <div className="support-card-subtitle">📧 Contact Support</div>
            <p className="support-card-text">
              Still need help? Reach out to us directly at{" "}
              <a href="mailto:support@biokey.com">support@biokey.com</a>. We&apos;re
              available 24/7 to assist you.
            </p>
          </div>
        </div>
        <div className="support-card-footer">
          <p className="support-card-text">
            Thank you for using BioKey — your trust drives our innovation.
          </p>
        </div>
      </div>
    </div>
  );
}
