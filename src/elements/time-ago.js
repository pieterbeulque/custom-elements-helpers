import BaseController from '../controllers/base';

export default {
	attributes: [
		'datetime',
	],
	controller: class extends BaseController {

		resolve() {
			// No need to wait for window.onload
			return Promise.resolve(true);
		}

		init() {
			this.translations = {
				ago: 'ago',
				year: ['year', 'years'],
				month: ['month', 'months'],
				week: ['week', 'weeks'],
				day: ['day', 'days'],
				hour: ['hour', 'hours'],
				minute: ['minute', 'minutes'],
				second: ['second', 'seconds'],
			};
		}

		getCountedNoun(key, count = 1) {
			if (!this.translations[key]) {
				return false;
			}

			if (typeof this.translations[key] === 'string') {
				return this.translations[key];
			}

			if (count === 1) {
				return this.translations[key][0];
			}

			return this.translations[key][1];
		}

		render() {
			const makeReadable = (datetime) => {
				const date = new Date(datetime);
				const time = date.getTime();
				const now = new Date();
				let calculated;

				if (!isNaN(time)) {
					const diff = Math.floor((now.getTime() - time));

					calculated = {};
					calculated.seconds = Math.round(diff / 1000);
					calculated.minutes = Math.round(calculated.seconds / 60);
					calculated.hours = Math.round(calculated.minutes / 60);
					calculated.days = Math.round(calculated.hours / 24);
					calculated.weeks = Math.round(calculated.days / 7);
					calculated.months = Math.round(calculated.weeks / 4);
					calculated.years = Math.round(calculated.months / 12);
				}

				if (calculated) {
					if (calculated.months > 12) {
						const years = this.getCountedNoun('year', calculated.years);
						return `${calculated.years} ${years} ${this.translations.ago}`;
					} else if (calculated.weeks > 7) {
						const months = this.getCountedNoun('month', calculated.months);
						return `${calculated.months} ${months} ${this.translations.ago}`;
					} else if (calculated.days > 21) {
						const weeks = this.getCountedNoun('week', calculated.weeks);
						return `${calculated.weeks} ${weeks} ${this.translations.ago}`;
					} else if (calculated.hours > 24) {
						const days = this.getCountedNoun('day', calculated.days);
						return `${calculated.days} ${days} ${this.translations.ago}`;
					} else if (calculated.minutes > 60) {
						const hours = this.getCountedNoun('hour', calculated.hours);
						return `${calculated.hours} ${hours} ${this.translations.ago}`;
					} else if (calculated.seconds > 60) {
						const minutes = this.getCountedNoun('minute', calculated.minutes);
						return `${calculated.minutes} ${minutes} ${this.translations.ago}`;
					}

					const seconds = this.getCountedNoun('second', calculated.seconds);
					return `${calculated.seconds} ${seconds} ${this.translations.ago}`;
				}

				// Do nothing if we can't calculate a time diff
				return this.el.textContent;
			};

			this.el.textContent = makeReadable(this.datetime);

			return this;
		}

	},
};
