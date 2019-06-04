export function waitForLoad() {
	return new Promise((resolve) => {
		if (document.readyState === 'complete') {
			resolve();
		} else {
			window.addEventListener('load', () => resolve(), false);
		}
	});
}

export function waitForDOMReady() {
	return new Promise((resolve) => {
		if (document.readyState === 'interactive' || document.readyState === 'complete') {
			resolve();
		} else {
			const handler = function () {
				if (document.readyState === 'interactive' || document.readyState === 'complete') {
					document.removeEventListener('readystatechange', handler, false);
					resolve();
				}
			};

			window.addEventListener('readystatechange', handler, false);
		}
	});
}
