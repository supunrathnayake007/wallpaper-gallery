import Script from "next/script";

const GoogleAdsense = ({ pId }) => {
  if (process.env.NODE_ENV !== "production") {
    return null;
  }
  return (
    <script
      async
      src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9033090968990814"
      crossorigin="anonymous"
    ></script>
  );
};

export default GoogleAdsense;
