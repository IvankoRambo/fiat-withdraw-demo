export const show = (container, styleOptions, extraClasses) => {
    const target = !container ? document.body : container;
    let previousElements;

    if (!container) {
        previousElements = target.querySelectorAll('.spinner-wrapper');
    } else {
        previousElements = target.querySelectorAll('.spinner');
    }
    previousElements.forEach(element => element.parentNode.removeChild(element));

    const spinner = document.createElement('div');
    spinner.classList.add('spinner');

    if (styleOptions != null) {
        for (let styleOption in styleOptions) {
            spinner.style[styleOption] = styleOptions[styleOption];
        }
    }

    if (extraClasses) {
        extraClasses = typeof extraClasses === 'string'
            ? [extraClasses] : extraClasses;

        for (let i = 0, len = extraClasses.length; i < len; i++) {
            spinner.classList.add(extraClasses[i]);
        }
    }

    if (!container) {
        const wrapper = document.createElement('div');
        wrapper.classList.add('spinner-wrapper');
        wrapper.prepend(spinner);
        target.prepend(wrapper);
    } else {
        target.style.position = 'relative';
        target.prepend(spinner);
    }
}

export const remove = (container) => {
    const target = !container ? document.body : container;
    let previousElements;
    if (!container) {
        previousElements = target.querySelectorAll('.spinner-wrapper');
    } else {
        previousElements = target.querySelectorAll('.spinner');
        target.style.position = 'static';
    }
    previousElements.forEach(element => element.parentNode.removeChild(element));
}