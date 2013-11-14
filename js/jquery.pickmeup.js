/**
 * @package		PickMeUp - jQuery datepicker plugin
 * @author		Nazar Mokrynskyi <nazar@mokrynskyi.com>
 * @author		Stefan Petre <www.eyecon.ro>
 * @copyright	Copyright (c) 2013, Nazar Mokrynskyi
 * @copyright	Copyright (c) 2008-2009, Stefan Petre
 * @license		MIT License, see license.txt
 */
(function ($) {
	$.pickmeup = {
		flat			: false,
		starts			: 1,
		prev			: '◀',
		next			: '▶',
		lastSel			: false,
		mode			: 'single',
		view			: 'days',
		calendars		: 1,
		format			: 'd-m-Y',
		position		: 'bottom',
		eventName		: 'click',
		onRender		: function(){return {};},
		onChange		: function(){return true;},
		onShow			: function(){return true;},
		onBeforeShow	: function(){return true;},
		onHide			: function(){return true;},
		locale			: {
			days		: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
			daysShort	: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
			daysMin		: ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"],
			months		: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
			monthsShort	: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
		}
	};
	var pickmeup = function () {
		var	views = {
				years: 'pmu-view-years',
				moths: 'pmu-view-months',
				days: 'pmu-view-days'
			},
			tpl = {
				wrapper	: '<div class="pickmeup" />',
				head	: function (d_) {
					function d (i) {
						return '<div>' + d_.day[i] + '</div>';
					}
					return '<div class="pmu-instance">' +
						'<nav>' +
							'<div class="pmu-prev pmu-button">' + d_.prev + '</div>' +
							'<div class="pmu-next pmu-button">' + d_.next + '</div>' +
							'<div class="pmu-month pmu-button" />' +
						'</nav>' +
						'<nav class="pmu-day-of-week">' + d(0) + d(1) + d(2) + d(3) + d(4) + d(5) + d(6) + '</nav>' +
					'</div>';
				},
				days	: function (days) {
					var	week,
						day,
						result	= [];
					for (week in days) {
						result[week]	= '';
						for (day in days[week]) {
							day				= days[week][day];
							result[week]	+= '<div class="' + day.class_name + ' pmu-button">' + day.text + '</div>'
						}
						result[week]	= '<div>' + result[week] + '</div>'
					}
					return '<div class="pmu-days">' + result.join('') + '</div>';
				},
				months	: function (d_) {
					function d (i) {
						return '<div class="pmu-button">' + d_.data[i] + '</div>';
					}
					return '<div class="' + d_.class_name + '">' +
						'<div>' + d(0) + d(1) + d(2) + d(3) + '</div>' +
						'<div>' + d(4) + d(5) + d(6) + d(7) + '</div>' +
						'<div>' + d(8) + d(9) + d(10) + d(11) + '</div>' +
					'</div>';
				}
			};
		function fill (cal) {
			cal = $(cal);
			var options = cal.data('pickmeup');
			var currentCal = Math.floor(options.calendars / 2), date, data, dow, month, cnt = 0, days, week_row, day_of_week, html, tblCal;
			cal.find('.pmu-instance > :not(nav)').remove();
			for (var i = 0; i < options.calendars; i++) {
				date = new Date(options.current);
				date.addMonths(-currentCal + i);
				tblCal = cal.find('.pmu-instance').eq(i);
				if (cal.hasClass('pmu-view-years')) {
					dow = (date.getFullYear() - 6) + ' - ' + (date.getFullYear()+5);
				} else if (cal.hasClass('pmu-view-months')) {
					dow = date.getFullYear();
				} else  if (cal.hasClass('pmu-view-days')) {
					dow = formatDate(date, 'B, Y');
				}
				tblCal.find('.pmu-month').text(dow);
				dow = date.getFullYear() - 6;
				data = {
					data		: [],
					class_name	: 'pmu-years'
				};
				for ( var j = 0; j < 12; j++) {
					data.data.push(dow + j);
				}
				html = tpl.months(data);
				date.setDate(1);
				data = [];
				month = date.getMonth();
				dow = (date.getDay() - options.starts) % 7;
				date.addDays(-(dow + (dow < 0 ? 7 : 0)));
				cnt = 0;
				while (cnt < 42) {
					week_row = parseInt(cnt / 7,10);
					day_of_week = cnt % 7;
					if (!data[week_row]) {
						data[week_row] = [];
					}
					data[week_row][day_of_week] = {
						text: date.getDate(),
						class_name: []
					};
					if (month != date.getMonth()) {
						data[week_row][day_of_week].class_name.push('pmu-not-in-month');
					}
					if (date.getDay() == 0) {
						data[week_row][day_of_week].class_name.push('pmu-sunday');
					}
					if (date.getDay() == 6) {
						data[week_row][day_of_week].class_name.push('pmu-saturday');
					}
					var fromUser = options.onRender(date);
					var val = date.valueOf();
					if (fromUser.selected || options.date == val || $.inArray(val, options.date) > -1 || (options.mode == 'range' && val >= options.date[0] && val <= options.date[1])) {
						data[week_row][day_of_week].class_name.push('pmu-selected');
					}
					if (fromUser.disabled) {
						data[week_row][day_of_week].class_name.push('pmu-disabled');
					}
					if (fromUser.className) {
						data[week_row][day_of_week].class_name.push(fromUser.className);
					}
					data[week_row][day_of_week].class_name = data[week_row][day_of_week].class_name.join(' ');
					cnt++;
					date.addDays(1);
				}
				html = tpl.days(data) + html;
				data = {
					data		: options.locale.monthsShort,
					class_name	: 'pmu-months'
				};
				html = tpl.months(data) + html;
				tblCal.append(html);
			}
		}
		function parseDate (date, format) {
			if (date.constructor == Date) {
				return new Date(date);
			}
			var parts = date.split(/\W+/);
			var against = format.split(/\W+/), d, m, y, h, min, now = new Date();
			for (var i = 0; i < parts.length; i++) {
				switch (against[i]) {
					case 'd':
					case 'e':
						d = parseInt(parts[i],10);
						break;
					case 'm':
						m = parseInt(parts[i], 10)-1;
						break;
					case 'Y':
					case 'y':
						y = parseInt(parts[i], 10);
						y += y > 100 ? 0 : (y < 29 ? 2000 : 1900);
						break;
					case 'H':
					case 'I':
					case 'k':
					case 'l':
						h = parseInt(parts[i], 10);
						break;
					case 'P':
					case 'p':
						if (/pm/i.test(parts[i]) && h < 12) {
							h += 12;
						} else if (/am/i.test(parts[i]) && h >= 12) {
							h -= 12;
						}
						break;
					case 'M':
						min = parseInt(parts[i], 10);
						break;
				}
			}
			return new Date(
				y === undefined ? now.getFullYear() : y,
				m === undefined ? now.getMonth() : m,
				d === undefined ? now.getDate() : d,
				h === undefined ? now.getHours() : h,
				min === undefined ? now.getMinutes() : min,
				0
			);
		}
		function formatDate (date, format) {
			var m = date.getMonth();
			var d = date.getDate();
			var y = date.getFullYear();
			var w = date.getDay();
			var s = {};
			var hr = date.getHours();
			var pm = (hr >= 12);
			var ir = (pm) ? (hr - 12) : hr;
			var dy = date.getDayOfYear();
			if (ir == 0) {
				ir = 12;
			}
			var min = date.getMinutes();
			var sec = date.getSeconds();
			var parts = format.split(''), part;
			for (var i = 0; i < parts.length; i++) {
				part = parts[i];
				switch (part) {
					case 'a':
						part = date.getDayName(false);
						break;
					case 'A':
						part = date.getDayName(true);
						break;
					case 'b':
						part = date.getMonthName(false);
						break;
					case 'B':
						part = date.getMonthName(true);
						break;
					case 'C':
						part = 1 + Math.floor(y / 100);
						break;
					case 'd':
						part = (d < 10) ? ("0" + d) : d;
						break;
					case 'e':
						part = d;
						break;
					case 'H':
						part = (hr < 10) ? ("0" + hr) : hr;
						break;
					case 'I':
						part = (ir < 10) ? ("0" + ir) : ir;
						break;
					case 'j':
						part = (dy < 100) ? ((dy < 10) ? ("00" + dy) : ("0" + dy)) : dy;
						break;
					case 'k':
						part = hr;
						break;
					case 'l':
						part = ir;
						break;
					case 'm':
						part = (m < 9) ? ("0" + (1+m)) : (1+m);
						break;
					case 'M':
						part = (min < 10) ? ("0" + min) : min;
						break;
					case 'p':
					case 'P':
						part = pm ? "PM" : "AM";
						break;
					case 's':
						part = Math.floor(date.getTime() / 1000);
						break;
					case 'S':
						part = (sec < 10) ? ("0" + sec) : sec;
						break;
					case 'u':
						part = w + 1;
						break;
					case 'w':
						part = w;
						break;
					case 'y':
						part = ('' + y).substr(2, 2);
						break;
					case 'Y':
						part = y;
						break;
				}
				parts[i] = part;
			}
			return parts.join('');
		}
		function extendDate (options) {
			if (Date.prototype.tempDate) {
				return;
			}
			Date.prototype.tempDate = null;
			Date.prototype.months = options.months;
			Date.prototype.monthsShort = options.monthsShort;
			Date.prototype.days = options.days;
			Date.prototype.daysShort = options.daysShort;
			Date.prototype.getMonthName = function(fullName) {
				return this[fullName ? 'months' : 'monthsShort'][this.getMonth()];
			};
			Date.prototype.getDayName = function(fullName) {
				return this[fullName ? 'days' : 'daysShort'][this.getDay()];
			};
			Date.prototype.addDays = function (n) {
				this.setDate(this.getDate() + n);
				this.tempDate = this.getDate();
			};
			Date.prototype.addMonths = function (n) {
				if (this.tempDate == null) {
					this.tempDate = this.getDate();
				}
				this.setDate(1);
				this.setMonth(this.getMonth() + n);
				this.setDate(Math.min(this.tempDate, this.getMaxDays()));
			};
			Date.prototype.addYears = function (n) {
				if (this.tempDate == null) {
					this.tempDate = this.getDate();
				}
				this.setDate(1);
				this.setFullYear(this.getFullYear() + n);
				this.setDate(Math.min(this.tempDate, this.getMaxDays()));
			};
			Date.prototype.getMaxDays = function() {
				var tmpDate = new Date(),
					d = 28, m;
				m = tmpDate.getMonth();
				while (tmpDate.getMonth() == m) {
					d ++;
					tmpDate.setDate(d);
				}
				return d - 1;
			};
			Date.prototype.getDayOfYear = function() {
				var now = new Date(this.getFullYear(), this.getMonth(), this.getDate(), 0, 0, 0);
				var then = new Date(this.getFullYear(), 0, 0, 0, 0, 0);
				var time = now - then;
				return Math.floor(time / 24*60*60*1000);
			};
		}
		function layout (cal) {
			cal = $(cal);
			var instance = cal.find('.pmu-instance');
			var width = 0;
			instance.each(function () {
				width	+= $(this).outerWidth();
			});
			var height = instance.outerHeight();
			cal.css({
				width: width + 'px',
				height: height + 'px'
			});
		}
		function click (e) {
			var el = $(e.target);
			if (el.hasClass('pmu-button')) {
				if (el.hasClass('pmu-disabled')) {
					return false;
				}
				var options = $(this).data('pickmeup');
				var instance = el.parents('.pmu-instance').eq(0);
				var root = instance.parent();
				var tblIndex = $('.pmu-instance', root).index(instance);
				var tmp = new Date(options.current);
				var changed = false;
				var fillIt = false;
				var val;
				if (el.parent().is('nav')) {
					if (el.hasClass('pmu-month')) {
						tmp.addMonths(tblIndex - Math.floor(options.calendars / 2));
						if (root.hasClass('pmu-view-years')) {
							root.removeClass('pmu-view-years').addClass('pmu-view-days');
							el.text(formatDate(tmp, 'B, Y'));
						} else if (root.hasClass('pmu-view-months')) {
							root.removeClass('pmu-view-months').addClass('pmu-view-years');
							el.text((tmp.getFullYear()-6) + ' - ' + (tmp.getFullYear()+5));
						} else if (root.hasClass('pmu-view-days')) {
							root.removeClass('pmu-view-days').addClass('pmu-view-months');
							el.text(tmp.getFullYear());
						}
					} else {
						if (root.hasClass('pmu-view-years')) {
							options.current.addYears(instance.hasClass('pmu-prev') ? -12 : 12);
						} else if (root.hasClass('pmu-view-months')) {
							options.current.addYears(instance.hasClass('pmu-prev') ? -1 : 1);
						} else if (root.hasClass('pmu-view-days')) {
							options.current.addMonths(instance.hasClass('pmu-prev') ? -1 : 1);
						}
						fillIt = true;
					}
				} else if (!el.hasClass('pmu-disabled')) {
					if (root.hasClass('pmu-view-years')) {
						options.current.setFullYear(parseInt(el.text(), 10));
						root.removeClass('pmu-view-years').addClass('pmu-view-months');
					} else if (root.hasClass('pmu-view-months')) {
						options.current.setMonth(root.find('.pmu-months .pmu-button').index(el));
						options.current.setFullYear(parseInt(root.find('.pmu-month').text(), 10));
						options.current.addMonths(Math.floor(options.calendars / 2) - tblIndex);
						root.removeClass('pmu-view-months').addClass('pmu-view-days');
					} else {
						val = parseInt(el.text(), 10);
						tmp.addMonths(tblIndex - Math.floor(options.calendars / 2));
						if (el.hasClass('pmu-not-in-month')) {
							tmp.addMonths(val > 15 ? -1 : 1);
						}
						tmp.setDate(val);
						switch (options.mode) {
							case 'multiple':
								val = (tmp.setHours(0,0,0,0)).valueOf();
								if ($.inArray(val, options.date) > -1) {
									$.each(options.date, function (nr, dat){
										if (dat == val) {
											options.date.splice(nr,1);
											return false;
										}
										return true;
									});
								} else {
									options.date.push(val);
								}
								break;
							case 'range':
								if (!options.lastSel) {
									options.date[0] = (tmp.setHours(0,0,0,0)).valueOf();
								}
								val = (tmp.setHours(23,59,59,0)).valueOf();
								if (val < options.date[0]) {
									options.date[1] = options.date[0] + 86399000;
									options.date[0] = val - 86399000;
								} else {
									options.date[1] = val;
								}
								options.lastSel = !options.lastSel;
								break;
							default:
								options.date = tmp.valueOf();
								break;
						}
					}
					fillIt = true;
					changed = true;
				}
				if (fillIt) {
					fill(root);
				}
				if (changed) {
					options.onChange.apply(this, prepareDate(options));
				}
			}
			return false;
		}
		function prepareDate (options) {
			var tmp;
			if (options.mode == 'single') {
				tmp = new Date(options.date);
				return [formatDate(tmp, options.format), tmp];
			} else {
				tmp = [[],[]];
				$.each(options.date, function(nr, val){
					var date = new Date(val);
					tmp[0].push(formatDate(date, options.format));
					tmp[1].push(date);
				});
				return tmp;
			}
		}
		function getViewport () {
			return {
				l : window.pageXOffset || document.documentElement.scrollLeft,
				t : window.pageYOffset || document.documentElement.scrollTop,
				w : window.innerWidth || document.documentElement.clientWidth,
				h : window.innerHeight || document.documentElement.clientHeight
			};
		}
		function isChildOf (parentEl, el, container) {
			if (parentEl == el) {
				return true;
			}
			if (parentEl.contains) {
				return parentEl.contains(el);
			}
			if ( parentEl.compareDocumentPosition ) {
				return !!(parentEl.compareDocumentPosition(el) & 16);
			}
			var prEl = el.parentNode;
			while(prEl && prEl != container) {
				if (prEl == parentEl)
					return true;
				prEl = prEl.parentNode;
			}
			return false;
		}
		function show (force) {
			var cal = this.pickmeup;
			if (force || !cal.is(':visible')) {
				fill(cal);
				var options = cal.data('pickmeup');
				options.onBeforeShow.call(this, cal);
				var pos = $(this).offset();
				var viewPort = getViewport();
				var top = pos.top;
				var left = pos.left;
				cal.css({
					visibility: 'hidden',
					display: 'block'
				});
				layout(cal);
				switch (options.position){
					case 'top':
						top -= cal.offsetHeight;
						break;
					case 'left':
						left -= cal.offsetWidth;
						break;
					case 'right':
						left += this.offsetWidth;
						break;
					case 'bottom':
						top += this.offsetHeight;
						break;
				}
				if (top + cal.offsetHeight > viewPort.t + viewPort.h) {
					top = pos.top  - cal.offsetHeight;
				}
				if (top < viewPort.t) {
					top = pos.top + this.offsetHeight + cal.offsetHeight;
				}
				if (left + cal.offsetWidth > viewPort.l + viewPort.w) {
					left = pos.left - cal.offsetWidth;
				}
				if (left < viewPort.l) {
					left = pos.left + this.offsetWidth
				}
				cal.css({
					visibility: 'visible',
					display: 'block',
					top: top + 'px',
					left: left + 'px'
				});
				if (options.onShow.apply(this, [cal.get(0)]) != false) {
					cal.show();
				}
				$(document).on('mousedown', {cal: cal, trigger: this}, hide);
			}
		}
		function hide (ev) {
			if (!ev.target || ev.target != ev.data.trigger && !isChildOf(ev.data.cal.get(0), ev.target, ev.data.cal.get(0))) {
				if (ev.data.cal.data('pickmeup').onHide.apply(this, [ev.data.cal.get(0)]) != false) {
					ev.data.cal.hide();
				}
				$(document).off('mousedown', hide);
			}
		}
		return {
			init: function(options){
				options = $.extend({}, $.pickmeup, options||{});
				extendDate(options.locale);
				options.calendars = Math.max(1, parseInt(options.calendars,10)||1);
				options.mode = /single|multiple|range/.test(options.mode) ? options.mode : 'single';
				return this.each(function(){
					if (!$(this).data('pickmeup')) {
						var i;
						if (options.date.constructor == String) {
							options.date = parseDate(options.date, options.format);
							options.date.setHours(0,0,0,0);
						}
						if (options.mode != 'single') {
							if (options.date.constructor != Array) {
								options.date = [options.date.valueOf()];
								if (options.mode == 'range') {
									options.date.push(((new Date(options.date[0])).setHours(23,59,59,0)).valueOf());
								}
							} else {
								for (i = 0; i < options.date.length; i++) {
									options.date[i] = (parseDate(options.date[i], options.format).setHours(0,0,0,0)).valueOf();
								}
								if (options.mode == 'range') {
									options.date[1] = ((new Date(options.date[1])).setHours(23,59,59,0)).valueOf();
								}
							}
						} else {
							options.date = options.date.valueOf();
						}
						if (!options.current) {
							options.current = new Date();
						} else {
							options.current = parseDate(options.current, options.format);
						}
						options.current.setDate(1);
						options.current.setHours(0,0,0,0);
						var cnt;
						var cal = $(tpl.wrapper).on('click', click).data('pickmeup', options);
						if (options.className) {
							cal.addClass(options.className);
						}
						var html = '';
						for (i = 0; i < options.calendars; i++) {
							cnt = options.starts;
							html += tpl.head({
								prev	: options.prev,
								next	: options.next,
								day		: [
									options.locale.daysMin[(cnt++) % 7],
									options.locale.daysMin[(cnt++) %7],
									options.locale.daysMin[(cnt++) %7],
									options.locale.daysMin[(cnt++) %7],
									options.locale.daysMin[(cnt++) % 7],
									options.locale.daysMin[(cnt++) % 7],
									options.locale.daysMin[(cnt++) % 7]
								]
							});
						}
						cal
							.addClass(views[options.view]).append(html);
						fill(cal);
						this.pickmeup	= cal;
						if (options.flat) {
							cal.appendTo(this).show().css('position', 'relative');
							layout(cal);
						} else {
							cal.appendTo(document.body);
							$(this).on(options.eventName, show);
						}
					}
				});
			},
			show: function() {
				return this.each( function () {
					if (this.pickmeup) {
						show.apply(this);
					}
				});
			},
			hide: function() {
				return this.each( function () {
					if (this.pickmeup) {
						hide.call(this, {
							data	: {
								cal	: this.pickmeup
							}
						});
					}
				});
			},
			update: function() {
				return this.each( function () {
					if (this.pickmeup) {
						$(document).off('mousedown', hide);
						show.call(this, true);
					}
				});
			},
			set_date: function(date, shiftTo){
				return this.each(function(){
					if (this.pickmeup) {
						var cal = this.pickmeup;
						var options = cal.data('pickmeup');
						options.date = date;
						if (options.date.constructor == String) {
							options.date = parseDate(options.date, options.format);
							options.date.setHours(0,0,0,0);
						}
						if (options.mode != 'single') {
							if (options.date.constructor != Array) {
								options.date = [options.date.valueOf()];
								if (options.mode == 'range') {
									options.date.push(((new Date(options.date[0])).setHours(23,59,59,0)).valueOf());
								}
							} else {
								for (var i = 0; i < options.date.length; i++) {
									options.date[i] = (parseDate(options.date[i], options.format).setHours(0,0,0,0)).valueOf();
								}
								if (options.mode == 'range') {
									options.date[1] = ((new Date(options.date[1])).setHours(23,59,59,0)).valueOf();
								}
							}
						} else {
							options.date = options.date.valueOf();
						}
						if (shiftTo) {
							options.current = new Date (options.mode != 'single' ? options.date[0] : options.date);
						}
						fill(cal);
					}
				});
			},
			get_date: function (formatted) {
				if (this[0].pickmeup) {
					return prepareDate(this[0].pickmeup.data('pickmeup'))[formatted ? 0 : 1];
				}
				return 0;
			},
			clear: function(){
				return this.each(function(){
					if (this.pickmeup) {
						var cal = this.pickmeup;
						var options = cal.data('pickmeup');
						if (options.mode != 'single') {
							options.date = [];
							fill(cal);
						}
					}
				});
			},
			fix_layout: function(){
				return this.each(function(){
					if (this.pickmeup) {
						var cal = $(this);
						var options = this.pickmeup;
						if (options.flat) {
							layout(cal);
						}
					}
				});
			}
		};
	}();
	$.fn.pickmeup	= function (options) {
		if (typeof options !== 'string') {
			pickmeup.init.apply(this, Array.prototype.slice.call(arguments));
		} else {
			switch (options) {
				case 'hide':
					return pickmeup.hide.apply(this);
				case 'show':
					return pickmeup.show.apply(this);
				case 'get_date':
					return pickmeup.get_date.apply(this, Array.prototype.slice.call(arguments, 1));
				case 'set_date':
					return pickmeup.set_date.apply(this, Array.prototype.slice.call(arguments, 1));
				case 'clear':
					return pickmeup.clear.apply(this);
				case 'fix_layout':
					return pickmeup.fix_layout.apply(this);
				case 'update':
					return pickmeup.update.apply(this);
			}
		}
		return this;
	};
})(jQuery);