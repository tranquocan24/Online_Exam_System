// test-basic-flow.js - Test cơ bản cho việc demo nhanh

const puppeteer = require('puppeteer');

class BasicFlowTester {
    constructor() {
        this.browser = null;
        this.page = null;
        this.baseUrl = 'http://localhost:3000';
    }

    async init() {
        console.log('🚀 Starting basic flow test...');
        this.browser = await puppeteer.launch({ 
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        this.page = await this.browser.newPage();
    }

    async testBasicFlow() {
        try {
            // Test 1: Check homepage loads
            await this.page.goto(this.baseUrl);
            const title = await this.page.title();
            console.log('✅ Homepage loaded:', title);
            
            // Test 2: Teacher login
            await this.page.type('#username', 'gv001');
            await this.page.type('#password', '123456');
            await this.page.click('button[type="submit"]');
            
            await this.page.waitForSelector('.teacher-dashboard', { timeout: 5000 });
            console.log('✅ Teacher login successful');
            
            // Test 3: Student login
            await this.page.evaluate(() => {
                localStorage.clear();
                sessionStorage.clear();
            });
            await this.page.goto(this.baseUrl);
            
            await this.page.type('#username', 'sv001');
            await this.page.type('#password', '123456');
            await this.page.click('button[type="submit"]');
            
            await this.page.waitForSelector('.student-dashboard', { timeout: 5000 });
            console.log('✅ Student login successful');
            
            console.log('🎉 All basic tests passed!');
            
        } catch (error) {
            console.error('❌ Test failed:', error.message);
            throw error;
        }
    }

    async cleanup() {
        if (this.browser) {
            await this.browser.close();
        }
    }
}

// Main execution
async function runBasicTest() {
    const tester = new BasicFlowTester();
    
    try {
        await tester.init();
        await tester.testBasicFlow();
    } catch (error) {
        console.error('Basic test failed:', error);
        process.exit(1);
    } finally {
        await tester.cleanup();
    }
}

// Check if running directly
if (require.main === module) {
    runBasicTest().catch(console.error);
}

module.exports = BasicFlowTester;
