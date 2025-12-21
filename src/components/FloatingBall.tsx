import { useState } from 'react';
import '../styles/FloatingBall.css';

// 微信群二维码图片URL
const QRCODE_URL = 'https://cdn.jsdelivr.net/gh/JSREI/.github/profile/README.assets/image-20231030132026541-7614065.png';

export function FloatingBall() {
  const [showQRCode, setShowQRCode] = useState(false);

  return (
    <div className="floating-ball">
      <button
        className="floating-ball-btn"
        onMouseEnter={() => setShowQRCode(true)}
        onMouseLeave={() => setShowQRCode(false)}
      >
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M8.5 10.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z" />
          <path d="M15.5 10.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z" />
          <path d="M12 2C6.48 2 2 6.48 2 12c0 1.54.36 2.98.97 4.29L2 22l5.71-.97A9.96 9.96 0 0 0 12 22c5.52 0 10-4.48 10-10S17.52 2 12 2zm0 18c-1.4 0-2.74-.36-3.9-1l-.28-.17-2.89.76.77-2.81-.19-.3A7.93 7.93 0 0 1 4 12c0-4.41 3.59-8 8-8s8 3.59 8 8-3.59 8-8 8z" />
          <path d="M17 12.5c-.28-.14-1.65-.81-1.9-.9-.26-.1-.44-.14-.63.14-.18.28-.72.9-.88 1.08-.16.19-.33.21-.6.07-.28-.14-1.16-.43-2.21-1.36-.82-.73-1.37-1.62-1.53-1.9-.16-.28-.02-.43.12-.57.12-.12.28-.33.42-.49.14-.16.19-.28.28-.47.1-.19.05-.35-.02-.49-.07-.14-.63-1.52-.86-2.08-.23-.55-.46-.47-.63-.48-.16-.01-.35-.01-.54-.01-.19 0-.49.07-.75.35-.26.28-.99.97-.99 2.36s1.01 2.74 1.15 2.93c.14.19 1.99 3.04 4.82 4.26.67.29 1.2.46 1.61.59.68.22 1.29.19 1.78.11.54-.08 1.65-.67 1.89-1.32.23-.65.23-1.2.16-1.32-.07-.12-.26-.19-.54-.33z" />
        </svg>
        <span className="floating-ball-text">交流群</span>
      </button>

      {showQRCode && (
        <div className="qrcode-popup">
          <img src={QRCODE_URL} alt="微信交流群二维码" />
          <div className="qrcode-tip">
            微信扫码发送 <strong>"leetcode"</strong>
            <br />
            加入算法交流群
          </div>
        </div>
      )}
    </div>
  );
}
