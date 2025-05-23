// components/StripeBuyButton.jsx
import React, { useEffect, useRef } from 'react';

export default function StripeBuyButton() {
  const containerRef = useRef();

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://js.stripe.com/v3/buy-button.js';
    script.async = true;
    containerRef.current.appendChild(script);
  }, []);

  return (
    <div ref={containerRef}>
      <stripe-buy-button
        buy-button-id="buy_btn_1RReWbQdIQrSu0g6bgHVDOCT"
        publishable-key="pk_test_51RReMiQdIQrSu0g6EqJ33OUUy97KO6Nq5xtO2VOmlknhrca0RXD99aClbi00bYuTOzZmXjHWnjuqQ1YhORVhutWM00I3IYPOUF"
      ></stripe-buy-button>
    </div>
  );
}
