import os
import pytest
from selenium import webdriver
from selenium.webdriver.chrome.options import Options

@pytest.fixture(scope="function")
def driver():
    chrome_options = Options()
    chrome_options.add_argument("--headless")
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-dev-shm-usage")
    chrome_options.add_argument("--window-size=1920,1080")
    
    driver = webdriver.Chrome(options=chrome_options)
    yield driver
    driver.quit()

@pytest.hookimpl(hookwrapper=True)
def pytest_runtest_makereport(item, call):
    outcome = yield
    report = outcome.get_result()
    
    if report.when == "call" and report.failed:
        try:
            driver = item.funcargs.get("driver")
            if driver:
                # Save screenshot to file
                if not os.path.exists("screenshots"):
                    os.makedirs("screenshots")
                screenshot_path = f"screenshots/{item.name}.png"
                driver.save_screenshot(screenshot_path)
                
                # Get base64 for embedding
                base64_image = driver.get_screenshot_as_base64()
                
                # Append to report
                pytest_html = item.config.pluginmanager.getplugin("html")
                if pytest_html:
                    extra = getattr(report, "extra", [])
                    img_html = f'<div><img src="data:image/png;base64,{base64_image}" style="width:600px;height:auto;" onclick="window.open(this.src)" align="right"/></div>'
                    extra.append(pytest_html.extras.html(img_html))
                    report.extra = extra
        except Exception as e:
            print(f"Failed to capture screenshot: {e}")
