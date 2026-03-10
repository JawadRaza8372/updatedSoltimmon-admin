export function isPaymentUnsafeBrowser() {
	const ua = navigator.userAgent || "";

	// In-app browsers
	const inApp =
		/FBAN|FBAV|Instagram|Line|Twitter|LinkedIn|Snapchat|TikTok|Threads/i.test(
			ua,
		);

	// WebView detection
	const isWebView =
		/(wv|WebView)/i.test(ua) || (/Android/i.test(ua) && !/Chrome/i.test(ua));

	// Problematic browsers
	const badBrowsers =
		/MiuiBrowser|MiBrowser|UCBrowser|Opera Mini|OPR\/Mini/i.test(ua);

	return inApp || isWebView || badBrowsers;
}
export function redirectToSafeBrowser() {
	const url = window.location.href;

	// Android → try Chrome
	if (/Android/i.test(navigator.userAgent)) {
		const intentUrl =
			`intent://${url.replace(/^https?:\/\//, "")}` +
			`#Intent;scheme=https;package=com.android.chrome;end;`;

		window.location.href = intentUrl;

		// fallback
		setTimeout(() => {
			window.location.href = url;
		}, 600);
		return;
	}

	// iOS → Safari (default)
	window.location.href = url;
}
