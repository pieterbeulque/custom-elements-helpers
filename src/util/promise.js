export default function promisify(method) {
	return new Promise((resolve, reject) => {
		const wait = method();

		if (wait instanceof Promise) {
			wait.then((...args) => {
				resolve(args);
			}, (...args) => {
				reject(args);
			});
		} else {
			resolve(wait);
		}
	});
}
