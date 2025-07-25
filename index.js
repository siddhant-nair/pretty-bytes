const BYTE_UNITS = [
	'B',
	'kB',
	'MB',
	'GB',
	'TB',
	'PB',
	'EB',
	'ZB',
	'YB',
];

const BIBYTE_UNITS = [
	'B',
	'KiB',
	'MiB',
	'GiB',
	'TiB',
	'PiB',
	'EiB',
	'ZiB',
	'YiB',
];

const BIT_UNITS = [
	'b',
	'kbit',
	'Mbit',
	'Gbit',
	'Tbit',
	'Pbit',
	'Ebit',
	'Zbit',
	'Ybit',
];

const BIBIT_UNITS = [
	'b',
	'kibit',
	'Mibit',
	'Gibit',
	'Tibit',
	'Pibit',
	'Eibit',
	'Zibit',
	'Yibit',
];

/*
Formats the given number using `Number#toLocaleString`.
- If locale is a string, the value is expected to be a locale-key (for example: `de`).
- If locale is true, the system default locale is used for translation.
- If no value for locale is specified, the number is returned unmodified.
*/
const toLocaleString = (number, locale, options) => {
	let result = number;
	if (typeof locale === 'string' || Array.isArray(locale)) {
		result = number.toLocaleString(locale, options);
	} else if (locale === true || options !== undefined) {
		result = number.toLocaleString(undefined, options);
	}

	return result;
};

const log10 = numberOrBigInt => {
	if (typeof numberOrBigInt === 'number') {
		return Math.log10(numberOrBigInt);
	}

	const string = numberOrBigInt.toString(10);

	return string.length + Math.log10('0.' + string.slice(0, 15));
};

const log = numberOrBigInt => {
	if (typeof numberOrBigInt === 'number') {
		return Math.log(numberOrBigInt);
	}

	return log10(numberOrBigInt) * Math.log(10);
};

const divide = (numberOrBigInt, divisor) => {
	if (typeof numberOrBigInt === 'number') {
		return numberOrBigInt / divisor;
	}

	const integerPart = numberOrBigInt / BigInt(divisor);
	const remainder = numberOrBigInt % BigInt(divisor);
	return Number(integerPart) + (Number(remainder) / divisor);
};

export default function prettyBytes(number, options) {
	if (typeof number !== 'bigint' && !Number.isFinite(number)) {
		throw new TypeError(`Expected a finite number, got ${typeof number}: ${number}`);
	}

	options = {
		bits: false,
		binary: false,
		space: true,
		...options,
	};

	const UNITS = options.bits
		? (options.binary ? BIBIT_UNITS : BIT_UNITS)
		: (options.binary ? BIBYTE_UNITS : BYTE_UNITS);

	const separator = options.space ? ' ' : '';

	if (options.signed && (typeof number === 'number' ? number === 0 : number === 0n)) {
		return ` 0${separator}${UNITS[0]}`;
	}

	const isNegative = number < 0;
	const prefix = isNegative ? '-' : (options.signed ? '+' : '');

	if (isNegative) {
		number = -number;
	}

	let localeOptions;

	if (options.minimumFractionDigits !== undefined) {
		localeOptions = {minimumFractionDigits: options.minimumFractionDigits};
	}

	if (options.maximumFractionDigits !== undefined) {
		localeOptions = {maximumFractionDigits: options.maximumFractionDigits, ...localeOptions};
	}

	if (number < 1) {
		const numberString = toLocaleString(number, options.locale, localeOptions);
		return prefix + numberString + separator + UNITS[0];
	}

	const exponent = Math.min(Math.floor(options.binary ? log(number) / Math.log(1024) : log10(number) / 3), UNITS.length - 1);
	number = divide(number, (options.binary ? 1024 : 1000) ** exponent);

	if (!localeOptions) {
		const minPrecision = Math.max(3, Number.parseInt(number, 10).toString().length);
		number = number.toPrecision(minPrecision);
	}

	const numberString = toLocaleString(Number(number), options.locale, localeOptions);

	const unit = UNITS[exponent];

	return prefix + numberString + separator + unit;
}
