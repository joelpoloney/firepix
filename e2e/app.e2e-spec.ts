import { SnapfireNgPage } from './app.po';

describe('snapfire-ng App', () => {
  let page: SnapfireNgPage;

  beforeEach(() => {
    page = new SnapfireNgPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
