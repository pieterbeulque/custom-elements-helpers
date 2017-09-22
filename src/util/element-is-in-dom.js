export default function elementIsInDOM(element, root = document.body) {
	if (!element) {
		return false;
	}

	if (element === root) {
		return false;
	}

	return root.contains(element);
}
