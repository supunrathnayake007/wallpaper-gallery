import { useEffect, useState } from "react";
import Modal from "./Modal";

const CheckThirdPartyCookies = () => {
  const [cookiesEnabled, setCookiesEnabled] = useState(true);
  const [showModal, setShowModal] = useState(true);

  useEffect(() => {
    debugger;
    console.log("CheckThirdPartyCookies component rendered");
    const iframe = document.createElement("iframe");
    iframe.style.display = "none";
    iframe.src = "http://localhost:3000/check-cookies.html";
    document.body.appendChild(iframe);

    const messageHandler = (event) => {
      //console.log("Message received:", event);
      //   console.log("event.origin - " + event.origin);
      //   console.log("window.location.origin - " + window.location.origin);
      //console.log("Message data:", event.data);
      if (event.origin === "http://localhost:3000") {
        if (event.data === "cookies-disabled") {
          console.log("Third-party cookies are disabled");
          setCookiesEnabled(false);
          setShowModal(true);
        } else {
          console.log("Third-party cookies are enabled");
        }
      }
    };

    window.addEventListener("message", messageHandler);

    return () => {
      window.removeEventListener("message", messageHandler);
      if (iframe.parentNode) {
        iframe.parentNode.removeChild(iframe);
      }
    };
  }, []);

  const handleAccept = () => {
    document.cookie = "cookieConsent=true; path=/";
    setShowModal(false);
    window.location.href = "/enable-cookies"; // Redirect to instructions page
  };

  return (
    <>
      {!cookiesEnabled && showModal && (
        <Modal>
          <h3 className="bg-yellow-500 rounded">Enable Third-Party Cookies</h3>
          <p className="bg-yellow-500 rounded">
            This site uses cookies to provide a better user experience. Please
            enable third-party cookies in your browser settings.
          </p>
          <button className="bg-yellow-500 rounded" onClick={handleAccept}>
            I Understand, Show Instructions
          </button>
        </Modal>
      )}
    </>
  );
};

export default CheckThirdPartyCookies;
