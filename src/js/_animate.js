export default

class KAnimate {
	constructor() {
		this.raf = window.requestAnimationFrame ||
			window.webkitRequestAnimationFrame ||
			window.msRequestAnimationFrame;

		let divTest = document.createElement("div");

		/* checking browser for necessary opportunities */
		this.canAnimate = (typeof this.raf === "function") &&
			("classList" in divTest) &&
			typeof divTest.style.transition !== undefined

		if (this.canAnimate) {
			this.raf = this.raf.bind(window);
		}

		/* requestAnimationFrame queue */
		this.frames = []
		this.framesRun = false

		this._handlers = new Map()
		this._timerIds = new Map()
	}

	show = (el, options = {}) => {
		// if element is not hidden and is not hiding
		// we can show element when he is hidden or he is hiding
		if (!this._isHidden(el) && !this._isHiding(el)) {
			return
		}

		if (!this.canAnimate) {
			this._show(el)
			return
		}

		// console.log('show')

		if (this._isHiding(el)) {
			this._removeCallback(el)
		}

		/* merge defaults and users options */
		let settings = this._calcOptions(options);

		/* set handler on animation finish */
		this._setFinishHandler(el, settings.track, settings.duration, () => {
			this._removeClasses(el, settings.classNames.enterActive);
			this._removeClasses(el, settings.classNames.enterTo);
			el.removeAttribute('data-animation-status')
			// console.log('remove show classes')
			settings.afterEnter(el);
		});

		this._show(el);
		el.setAttribute('data-animation-status', 'showing')
		this._addClasses(el, settings.classNames.enter);
		settings.beforeEnter(el);

		this._addFrame(() => {
			this._addClasses(el, settings.classNames.enterActive);
		});

		this._addFrame(() => {
			this._removeClasses(el, settings.classNames.enter);
			this._addClasses(el, settings.classNames.enterTo);
		});
	}

	hide = (el, options = {}) => {
		// We can not hide element when he is hidden of he is hiding now!!!
		if (this._isHidden(el) || this._isHiding(el)) {
			return
		}

		if (!this.canAnimate) {
			this._hide(el)
			return
		}

		// console.log('hide')

		if (this._isShowing(el)) {
			this._removeCallback(el)
		}

		let settings = this._calcOptions(options);

		this._setFinishHandler(el, settings.track, settings.duration, () => {
			this._hide(el);
			this._removeClasses(el, settings.classNames.leaveActive);
			this._removeClasses(el, settings.classNames.leaveTo);
			el.removeAttribute('data-animation-status')
			// console.log('remove hide classes')
			// options.systemOnEnd && options.systemOnEnd();
			settings.afterLeave(el);
		});

		this._addClasses(el, settings.classNames.leave)
		el.setAttribute('data-animation-status', 'hiding')

		settings.beforeLeave(el);

		this._addFrame(() => {
			this._addClasses(el, settings.classNames.leaveActive);
		});

		this._addFrame(() => {
			this._addClasses(el, settings.classNames.leaveTo);
			this._removeClasses(el, settings.classNames.leave);
		});
	}

	// insert(target, el, options = {}, before = null) {
	// 	this._hide(el);
	// 	target.insertBefore(el, before);
	// 	this.show(el, options);
	// }

	// remove(el, options = {}) {
	// 	options.systemDoneCallback = function () {
	// 		el.parentNode.removeChild(el);
	// 	}

	// 	this.hide(el, options);
	// }

	_removeCallback = (el) => {
		this._handlers.get(el).handler()
		clearTimeout(this._timerIds.get(el))
		this._timerIds.delete(el)
	}

	_setFinishHandler = (el, track, duration, fn) => {
		let eventName;
		let isCssTrack = true;

		if (track === 'transition') {
			eventName = 'transitionend';
		} else if (track === 'animation') {
			eventName = 'animationend';
		} else {
			isCssTrack = false;
		}

		if (isCssTrack) {
			const handler = () => {
				el.removeEventListener(eventName, handler)
				this._handlers.delete(el)
				fn();
			}

			this._handlers.set(el, {handler, eventName})

			el.addEventListener(eventName, handler);
		} else {
			const timerId = setTimeout(fn, duration);
			this._timerIds.set(el, timerId)
		}
	}

	_calcOptions = (options) => {
		let name = (options.name !== undefined) ? options.name : 'animClass'
		let classNames = this._mergeSettings(this._classNames(name), options.classNames)

		delete options.classNames

		let defaults = {
			name: '',
			track: 'transition',
			duration: null,
			classNames: classNames,
			beforeEnter(el) {},
			afterEnter(el) {},
			beforeLeave(el) {},
			afterLeave(el) {},
			systemDoneCallback(el) {}
		}

		let norm = this._mergeSettings(defaults, options)

		return norm
	}

	_classNames = (name) => {
		return {
			enter: name + '-enter',
			enterActive: name + '-enter-active',
			enterTo: name + '-enter-to',
			leave: name + '-leave',
			leaveActive: name + '-leave-active',
			leaveTo: name + '-leave-to'
		}
	}

	_addFrame = (fn) => {
		this.frames.push(fn);

		if (!this.framesRun) {
			this._nextFrame();
		}
	}

	_nextFrame = () => {
		if (this.frames.length === 0) {
			this.framesRun = false;
			return;
		}

		let frame = this.frames.shift();

		this.raf(() => {
			this.raf(() => {
				frame();
				this._nextFrame();
			});
		});
	}

	_addClasses = (el, str) => {
		let arr = str.split(' ');

		for (let i = 0; i < arr.length; i++) {
			el.classList.add(arr[i]);
		}
	}

	_removeClasses = (el, str) => {
		let arr = str.split(' ');

		for (let i = 0; i < arr.length; i++) {
			el.classList.remove(arr[i]);
		}
	}

	_mergeSettings = (defaults, extra) => {
		if (typeof extra !== "object") {
			return defaults;
		}

		let res = {};

		for (let k in defaults) {
			res[k] = (extra[k] !== undefined) ? extra[k] : defaults[k];
		}

		return res;
	}

	_hide = (el) => {
		el.style.display = 'none'
		// console.log('display: none')
	}

	_show = (el) => {
		el.style.display = 'block'
		// console.log('display: block')
	}

	_isHidden = (el) => {
		return getComputedStyle(el).display === 'none'
	}

	_getStyle = (el, prop) => {
		return getComputedStyle(el)[prop];
	}

	_isHiding = (el) => {
		if (el.hasAttribute('data-animation-status')) {
			return el.getAttribute('data-animation-status') === 'hiding'
		}

		return false
	}

	_isShowing = (el) => {
		if (el.hasAttribute('data-animation-status')) {
			return el.getAttribute('data-animation-status') === 'showing'
		}

		return false
	}

	destroy = () => {
		if (this._handlers.size) {
			const elements = this._handlers.entries()

			for (let elem of elements){
				let [el, obj] = elem
				el.removeEventListener(obj.eventName, obj.handler)
			}

			this._handlers.clear()
		}
		
		if (this._timerIds.size) {
			const ids = this._timerIds.values()

			for (let id of ids){
				clearTimeout()
			}

			this._handlers.clear()
		}
	}
}