/* eslint-disable @typescript-eslint/no-explicit-any */
import { config } from "../support/config";

import type { ICustomWorld } from "../support/custom-world";

let element: any;
let selector: any;

export class BasePage {
  world: ICustomWorld;

  constructor(world: ICustomWorld) {
    this.world = world;
  }

  get byTestId() {
    return "data-testid=";
  }

  async getInputSelector(selector: string) {
    return `//input[@${selector}]`;
  }

  async click(element: any, testId?: boolean) {
    selector = element;
    if (testId == true) {
      selector = this.byTestId + element;
    }
    await this.world.page?.waitForSelector(selector, config.increasedTimeout);
    await this.world.page?.locator(selector).first().click({ force: true, timeout: 5000 });
  }

  async dblClick(element: any) {
    await this.world.page?.locator(element).first().dblclick({ force: true, timeout: 5000 });
  }

  async fill(element: any, text: string, testId?: boolean) {
    selector = element;
    if (testId == true) {
      selector = this.byTestId + element;
    }
    await this.world.page?.waitForSelector(selector, config.increasedTimeout);
    await this.world.page?.locator(selector).isEnabled(config.increasedTimeout);
    await this.world.page?.fill(selector, text, config.increasedTimeout);
  }

  async clickBy(elementType: string, value: string) {
    element = await this.returnElementByType(elementType, value);
    await element.click(config.increasedTimeout);
  }

  async clickByText(text: string) {
    selector = `//*[not(self::title)][contains(text(),'${text}')]`;
    await this.world.page?.locator(selector).first().click();
  }

  async pressButton(buttonName: string) {
    await this.world.page?.keyboard.press(buttonName);
    await this.world.page?.keyboard.up(buttonName);
  }

  async getElementByAlt(text: string) {
    element = await this.world.page?.locator(`//*[@alt='${text}'][1]`);
    return await element;
  }

  async getElementByClass(text: string) {
    element = await this.world.page?.locator(`//*[@class='${text}'][1]`);
    return await element;
  }

  async getElementByPartialClass(text: string) {
    element = await this.world.page?.locator(`//*[contains(@class, '${text}')]`);
    return await element;
  }

  async getElementByText(text: string) {
    element = await this.world.page?.locator(`//*[text()="${text}"][1]`).first();
    return await element;
  }

  async getElementByPartialText(text: string) {
    element = await this.world.page?.locator(`//*[not(self::title)][contains(text(),'${text}')][1]`).first();
    return await element;
  }

  async getElementByPartialHref(partialHref: string) {
    element = await this.world.page?.locator(`//*[contains(@href,'${partialHref}')]`);
    await element.scrollIntoViewIfNeeded();
    return await element;
  }

  async getElementByHref(partialHref: string) {
    element = await this.world.page?.locator(`//*[@href='${partialHref}']`);
    await element.scrollIntoViewIfNeeded();
    return await element;
  }

  async getElementById(id: string) {
    element = await this.world.page?.locator(`#${id}`);
    await element.scrollIntoViewIfNeeded();
    return await element;
  }

  async getElementByPlaceholder(placeholder: string) {
    element = await this.world.page?.locator(`//*[@placeholder='${placeholder}']`);
    await element.scrollIntoViewIfNeeded();
    return await element;
  }

  async getElementByTestIdAndText(testid: string, text: string) {
    element = await this.world.page?.locator(`//*[@${this.byTestId}'${testid}' and contains(text(), '${text}')]`);
    await element.scrollIntoViewIfNeeded();
    return await element;
  }

  async getElementByTestId(testid: string) {
    element = await this.world.page?.locator(`${this.byTestId}${testid}`);
    await element.scrollIntoViewIfNeeded();
    return await element;
  }

  async getElementByPartialTestId(partiaTestid: string) {
    element = await this.world.page?.locator(`//*[contains(@data-testid, '${partiaTestid}')]`);
    await element.scrollIntoViewIfNeeded();
    return await element;
  }

  async getElementByTitle(title: string) {
    element = await this.world.page?.locator(`//*[@title='${title}']`);
    await element.scrollIntoViewIfNeeded();
    return await element;
  }

  async getElementByType(type: string) {
    element = await this.world.page?.locator(`//*[@type='${type}']`);
    await element.scrollIntoViewIfNeeded();
    return await element;
  }

  async returnElementByType(elementType: string, value: string) {
    if (elementType === "alt") {
      element = await this.getElementByAlt(value);
    } else if (elementType === "class") {
      element = await this.getElementByClass(value);
    } else if (elementType === "partial class") {
      element = await this.getElementByPartialClass(value);
    } else if (elementType === "text") {
      element = await this.getElementByText(value);
    } else if (elementType === "partial text") {
      element = await this.getElementByPartialText(value);
    } else if (elementType === "partial href") {
      element = await this.getElementByPartialHref(value);
    } else if (elementType === "href") {
      element = await this.getElementByHref(value);
    } else if (elementType === "id") {
      element = await this.getElementById(value);
    } else if (elementType === "testId") {
      element = await this.getElementByTestId(value);
    } else if (elementType === "partial testId") {
      element = await this.getElementByPartialTestId(value);
    } else if (elementType === "title") {
      element = await this.getElementByTitle(value);
    } else if (elementType === "type") {
      element = await this.getElementByType(value);
    } else if (elementType === "placeholder") {
      element = await this.getElementByPlaceholder(value);
    }
    return element;
  }

  public async goTo(address: string) {
    try {
      await this.world.page?.goto(address);
      await this.world.page?.waitForLoadState("load", config.increasedTimeout);
    } catch {
      await this.world.page?.goto(address);
      console.warn("Retry the atteption reaching url ", address);
    }
  }
}
