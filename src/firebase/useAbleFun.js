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
export const markersHtmlFun = (loc, textStrings) => {
	return `			 
    <div  style="
    display: flex;
    flex-direction: row;
    align-items: flex-start;
    gap: 15px;
	width:100%;  
	z-index:4;
">
    <!-- Google Icon Container -->
    <div style="
        width: 46px;
        height: 46px;
        border-radius: 8px;
        background-color: #E7F0FF;
        display: flex;
        align-items: center;
        justify-content: center;
    ">
        <img src="/google-icon.png" alt="Google Icon" style="
            width: 80%;
            height: 80%;
            object-fit: contain;
        " />
    </div>

    <!-- Text Container -->
    <div style="
	flex:1;
        display: flex;
        flex-direction: column;
        gap: 16px;
		overflow:hidden;
    ">
        <!-- Title Line Container -->
       <div style="
            display: flex;
            flex-direction: row;
            align-items: center;
            justify-content: space-between;
            gap: 10px;
            width: 100%;
        ">
            <span style="
                font-size: 14px;
                font-weight: 600;
                color: #000000;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
                flex: 1;
            ">
                ${loc.name}
            </span>
            <button style="
                width: 24px;
                height: 24px;
                border-radius: 20px;
                background-color: #006FFF;
                display: flex;
                align-items: center;
                justify-content: center;
                border: none !important;
				outline:none !important;
                cursor: pointer;
				padding:10px 0px;
				"
            id="popup-close-btn">
                <img src="/close-icon.png" alt="Close" style="
                    width: 10px;
                    height: 10px;
                    object-fit: contain;
					filter: brightness(0) invert(1);
                " />
            </button>
	 </div>

        <!-- Open Hours -->
		<div style="width:100%;display:flex;flex-direction:column;height:auto;">
		 <p style="
            font-size: 10px;
            font-weight: 400;
            color: #000000;
            overflow: hidden;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
			margin:0px !important;
        ">
           ${textStrings.openingHours}: ${loc?.openingHours}
		</p>
		 <p style="
            font-size: 10px;
            font-weight: 400;
            color: #000000;
            overflow: hidden;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
			margin:0px !important;
        ">
		   ${textStrings.sunHours}: ${loc?.sunHours}
        </p>
		</div>
        

        <!-- Learn More Button -->
        <button style="
            display: flex;
            flex-direction: row;
            align-items: center;
            gap: 4px;
            background: none;
            border: none;
            cursor: pointer;
            padding: 0;
        "       onclick='sendToApp(${JSON.stringify(loc?.id ?? "")})'>
            <span style="
                font-size: 12px;
                font-weight: 700;
                color: #006FFF;
            ">${textStrings.learnMore}</span>
            <img src="/learn-icon.png" alt="Learn Icon" style="
                width: 15px;
                height: 15px;
                object-fit: contain;
                filter: invert(28%) sepia(93%) saturate(2579%) hue-rotate(204deg) brightness(97%) contrast(101%);
            " />
        </button>
    </div>
</div>
      `;
};
export const markersCurrentHtmlFun = (textStrings) => {
	return `			 
    <div  style="
    display: flex;
    flex-direction: row;
    align-items: flex-start;
    gap: 15px;
	width:100%;  
	z-index:4;
">
    <!-- Google Icon Container -->
    <div style="
        width: 46px;
        height: 46px;
        border-radius: 8px;
        background-color: #E7F0FF;
        display: flex;
        align-items: center;
        justify-content: center;
    ">
        <img src="/plan-icon.png" alt="Plan Icon" style="
            width: 80%;
            height: 80%;
            object-fit: contain;
        " />
    </div>

    <!-- Text Container -->
    <div style="
	flex:1;
        display: flex;
        flex-direction: column;
        gap: 16px;
		overflow:hidden;
    ">
        <!-- Title Line Container -->
       <div style="
            display: flex;
            flex-direction: row;
            align-items: center;
            justify-content: space-between;
            gap: 10px;
            width: 100%;
        ">
            <span style="
                font-size: 14px;
                font-weight: 600;
                color: #000000;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
                flex: 1;
            ">
                         ${textStrings.you}
            </span>
            <button style="
                width: 24px;
                height: 24px;
                border-radius: 20px;
                background-color: #006FFF;
                display: flex;
                align-items: center;
                justify-content: center;
                border: none !important;
				outline:none !important;
                cursor: pointer;
				padding:10px 0px;
				"
            id="popup-close-btn">
                <img src="/close-icon.png" alt="Close" style="
                    width: 10px;
                    height: 10px;
                    object-fit: contain;
					filter: brightness(0) invert(1);
                " />
            </button>
	 </div>

        <!-- Open Hours -->
		<div style="width:100%;display:flex;flex-direction:column;height:auto;">
		 <p style="
            font-size: 10px;
            font-weight: 400;
            color: #000000;
            overflow: hidden;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
			margin:0px !important;
        ">
           ${textStrings.youCurrentLocation}
		</p>
		
		</div>
        

          </div>
</div>
      `;
};
