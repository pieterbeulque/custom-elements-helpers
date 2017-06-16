export default function waitForDOMReady() {
	return new Promise((resolve) => {
		if (document.readyState === 'complete') {
			resolve();
		} else {
			const handler = function () {
				if (document.readyState === 'complete') {
					document.removeEventListener('readystatechange', handler, false);
					resolve();
				}
			};

			document.addEventListener('readystatechange', handler, false);
		}
	});
}
