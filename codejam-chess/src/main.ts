import { URLS } from './constants';
import ElementCreator from './elementCreator';
import MainPage from './mainPage';
import IndexedDB from './replays/indexedDb';

export default class Main {
  header: HTMLElement;

  mainPage: MainPage;

  createHeader() {
    const header = ElementCreator.createElement('header', ['header']);
    const headerContent = ElementCreator.createElement('div', ['header-content']);
    headerContent.classList.add('content');
    header.append(headerContent);
    const logoWrapper = ElementCreator.createElement('div', ['header--logo-wrapper']);
    const logo = ElementCreator.createImage(`${URLS.iconsPath}/logo.png`, ['logo']);
    const title = ElementCreator.createElement('h2', ['header--title'], 'Chess');
    logoWrapper.append(logo, title);
    headerContent.append(logoWrapper);
    this.header = header;
    return header;
  }

  createMainPage() {
    this.mainPage = new MainPage();
    this.mainPage.htmlMainPage.append(this.mainPage.createMainMenu());
    this.mainPage.setMenuClick();
  }

  createProject() {
    this.createHeader();
    document.body.append(this.header);
    this.createMainPage();
    document.body.append(this.mainPage.htmlMainPage);
    const database = new IndexedDB();
    database.createDB();
  }
}
