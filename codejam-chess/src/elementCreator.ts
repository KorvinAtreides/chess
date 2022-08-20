interface SelectOption {
  disabled: boolean;
  selected: boolean;
  textContent: string;
  value: string;
}

export default class ElementCreator {
  static createElement(type: string, classList?: Array<string>, textContent: string = '') {
    const element = document.createElement(type);
    if (classList) {
      classList.forEach((classString) => element.classList.add(classString));
    }
    element.textContent = textContent;
    return element;
  }

  static createImage(url: string, classList?: Array<string>) {
    const image = document.createElement('img');
    image.src = url;
    if (classList) {
      classList.forEach((classString) => image.classList.add(classString));
    }
    return image;
  }

  static createInput(type: string = 'text', classList?: Array<string>, title?: string) {
    const input = document.createElement('input');
    input.setAttribute('type', `${type}`);
    if (classList) {
      classList.forEach((classString) => input.classList.add(classString));
    }
    if (title) {
      input.setAttribute('title', `${title}`);
    }
    return input;
  }

  static createSelect(options?: Array<SelectOption>, classList?: Array<string>) {
    const select = document.createElement('select');
    if (options) {
      options.forEach((option) => {
        const optionTag = document.createElement('option');
        optionTag.value = option.value;
        optionTag.textContent = option.textContent;
        if (option.disabled) optionTag.setAttribute('disabled', 'disabled');
        if (option.selected) optionTag.setAttribute('selected', 'selected');
        select.append(optionTag);
      });
    }
    if (classList) {
      classList.forEach((classString) => select.classList.add(classString));
    }
    return select;
  }
}
