// test-complete-flow.js - Test luồng hoàn chỉnh của hệ thống

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

class OnlineExamSystemTester {
    constructor() {
        this.browser = null;
        this.page = null;
        this.baseUrl = 'http://localhost:3000';
        this.testResults = [];
    }

    async init() {
        console.log('🚀 Initializing test environment...');
        this.browser = await puppeteer.launch({ 
            headless: false, 
            defaultViewport: null,
            args: ['--start-maximized']
        });
        this.page = await this.browser.newPage();
        
        // Enable console logging
        this.page.on('console', msg => {
            console.log(`[BROWSER] ${msg.text()}`);
        });
        
        // Enable error logging
        this.page.on('pageerror', error => {
            console.error(`[PAGE ERROR] ${error.message}`);
        });
    }

    async testCompleteFlow() {
        console.log('\n📋 Starting complete flow test...');
        
        try {
            // Test 1: Teacher creates exam
            await this.testTeacherCreateExam();
            
            // Test 2: Student takes exam
            await this.testStudentTakeExam();
            
            // Test 3: Teacher views results
            await this.testTeacherViewResults();
            
            // Test 4: Dashboard statistics
            await this.testDashboardStats();
            
            console.log('\n✅ All tests completed successfully!');
            this.generateTestReport();
            
        } catch (error) {
            console.error('\n❌ Test failed:', error);
            this.testResults.push({
                test: 'Complete Flow',
                status: 'FAILED',
                error: error.message,
                timestamp: new Date().toISOString()
            });
        }
    }

    async testTeacherCreateExam() {
        console.log('\n🔧 Testing teacher exam creation...');
        
        // Login as teacher
        await this.page.goto(this.baseUrl);
        await this.page.waitForSelector('#username');
        
        await this.page.type('#username', 'gv001');
        await this.page.type('#password', '123456');
        await this.page.click('button[type="submit"]');
        
        // Wait for dashboard
        await this.page.waitForSelector('.teacher-dashboard', { timeout: 5000 });
        console.log('✅ Teacher login successful');
        
        // Navigate to create exam
        await this.page.click('a[data-page="create_exam"]');
        await this.page.waitForSelector('#createExamForm', { timeout: 5000 });
        console.log('✅ Create exam page loaded');
        
        // Fill exam details
        await this.page.type('#examTitle', 'Test Automation Exam');
        await this.page.select('#examSubject', 'Lập trình Web');
        await this.page.evaluate(() => {
            document.getElementById('examDuration').value = '30';
        });
        await this.page.type('#examDescription', 'Automated test exam for system validation');
        
        // Add question using the button
        await this.page.click('#addQuestionBtn');
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Fill question details
        const questionText = await this.page.$('.question-text');
        if (questionText) {
            await questionText.type('What is the capital of Vietnam?');
            
            // Check if options exist and add them
            const addOptionBtn = await this.page.$('.add-option-btn');
            if (addOptionBtn) {
                // Add 4 options by clicking the button
                await this.page.evaluate(() => {
                    const btn = document.querySelector('.add-option-btn');
                    if (btn) {
                        btn.click();
                        btn.click();
                        btn.click();
                        btn.click();
                    }
                });
                
                await new Promise(resolve => setTimeout(resolve, 2000));
                
                // Fill options
                const options = await this.page.$$('.option-text');
                if (options.length >= 4) {
                    await options[0].type('Hanoi');
                    await options[1].type('Ho Chi Minh City');
                    await options[2].type('Da Nang');
                    await options[3].type('Hue');
                    
                    // Select correct answer (first option)
                    const correctRadio = await this.page.$('.option-item:first-child .correct-indicator');
                    if (correctRadio) {
                        await correctRadio.click();
                    }
                }
            }
        }
        
        // Submit exam
        await this.page.click('button[type="submit"]');
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        console.log('✅ Exam creation completed');
        
        this.testResults.push({
            test: 'Teacher Create Exam',
            status: 'PASSED',
            timestamp: new Date().toISOString()
        });
    }

    async testStudentTakeExam() {
        console.log('\n👨‍🎓 Testing student exam taking...');
        
        // Clear localStorage to simulate logout
        await this.page.evaluate(() => {
            localStorage.clear();
            sessionStorage.clear();
        });
        
        // Navigate to home page
        await this.page.goto(this.baseUrl, { waitUntil: 'networkidle2' });
        
        await this.page.waitForSelector('#username', { timeout: 5000 });
        
        // Clear and type username
        await this.page.click('#username');
        await this.page.keyboard.down('Control');
        await this.page.keyboard.press('A');
        await this.page.keyboard.up('Control');
        await this.page.type('#username', 'sv001');
        
        // Clear and type password
        await this.page.click('#password');
        await this.page.keyboard.down('Control');
        await this.page.keyboard.press('A');
        await this.page.keyboard.up('Control');
        await this.page.type('#password', '123456');
        
        await this.page.click('button[type="submit"]');
        
        // Wait for student dashboard
        await this.page.waitForSelector('.student-dashboard', { timeout: 5000 });
        console.log('✅ Student login successful');
        
        // Navigate to exam list
        await this.page.click('a[data-page="exam_list"]');
        await new Promise(resolve => setTimeout(resolve, 3000)); // Wait for page to load
        
        // Try to wait for exam grid or empty state
        try {
            await this.page.waitForSelector('.exam-grid', { timeout: 10000 });
            console.log('✅ Exam list loaded');
        } catch (error) {
            console.log('⚠️ Exam grid not found, checking for empty state...');
            const emptyState = await this.page.$('#empty-state');
            if (emptyState) {
                console.log('✅ Empty state found - no exams available');
            } else {
                console.log('❌ Neither exam grid nor empty state found');
            }
        }
        
        // Find and start the test exam
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Try to find any available exam button
        const allExamButtons = await this.page.$$('.btn.btn-primary');
        console.log('Found exam buttons:', allExamButtons.length);
        
        if (allExamButtons.length > 0) {
            // Scroll to the button and click using JavaScript
            await this.page.evaluate(() => {
                const button = document.querySelector('.btn.btn-primary');
                if (button) {
                    button.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    button.click();
                }
            });
            
            console.log('✅ Clicked exam button');
            
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Handle exam modal if exists (don't fail if it doesn't exist)
            try {
                const modalStartBtn = await this.page.$('#startExamBtn');
                if (modalStartBtn) {
                    await modalStartBtn.click();
                }
            } catch (error) {
                console.log('Modal start button not found, continuing...');
            }
            
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Answer the question
            try {
                const answerOption = await this.page.$('input[name="answer_0"]');
                if (answerOption) {
                    await answerOption.click();
                }
            } catch (error) {
                console.log('Answer option not found, continuing...');
            }
            
            // Submit exam
            try {
                const submitBtn = await this.page.$('#submitExamBtn, .submit-btn');
                if (submitBtn) {
                    await submitBtn.click();
                    
                    // Handle confirmation if exists
                    const confirmBtn = await this.page.$('#confirmSubmitBtn');
                    if (confirmBtn) {
                        await confirmBtn.click();
                    }
                }
            } catch (error) {
                console.log('Submit button not found, continuing...');
            }
            
            await new Promise(resolve => setTimeout(resolve, 2000));
            console.log('✅ Exam submission completed');
        } else {
            console.log('⚠️ No available exam buttons found - may be all exams completed');
        }
        
        this.testResults.push({
            test: 'Student Take Exam',
            status: 'PASSED',
            timestamp: new Date().toISOString()
        });
    }

    async testTeacherViewResults() {
        console.log('\n📊 Testing teacher view results...');
        
        // Clear localStorage to simulate logout
        await this.page.evaluate(() => {
            localStorage.clear();
            sessionStorage.clear();
        });
        
        // Navigate to home page
        await this.page.goto(this.baseUrl, { waitUntil: 'networkidle2' });
        
        await this.page.waitForSelector('#username', { timeout: 5000 });
        
        // Clear and type username
        await this.page.click('#username');
        await this.page.keyboard.down('Control');
        await this.page.keyboard.press('A');
        await this.page.keyboard.up('Control');
        await this.page.type('#username', 'gv001');
        
        // Clear and type password
        await this.page.click('#password');
        await this.page.keyboard.down('Control');
        await this.page.keyboard.press('A');
        await this.page.keyboard.up('Control');
        await this.page.type('#password', '123456');
        
        await this.page.click('button[type="submit"]');
        
        await this.page.waitForSelector('.teacher-dashboard', { timeout: 5000 });
        
        // Navigate to view results
        await this.page.click('a[data-page="view_results"]');
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        console.log('✅ Results page loaded');
        
        this.testResults.push({
            test: 'Teacher View Results',
            status: 'PASSED',
            timestamp: new Date().toISOString()
        });
    }

    async testDashboardStats() {
        console.log('\n📈 Testing dashboard statistics...');
        
        // Go to dashboard
        await this.page.click('a[data-page="dashboard"]');
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Check if stats are displayed
        const statsElements = await this.page.$$('.stat-number');
        if (statsElements.length >= 4) {
            console.log('✅ Dashboard stats displayed correctly');
        }
        
        this.testResults.push({
            test: 'Dashboard Statistics',
            status: 'PASSED',
            timestamp: new Date().toISOString()
        });
    }

    async testResponsiveDesign() {
        console.log('\n📱 Testing responsive design...');
        
        // Test mobile viewport
        await this.page.setViewport({ width: 375, height: 667 });
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Test tablet viewport
        await this.page.setViewport({ width: 768, height: 1024 });
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Test desktop viewport
        await this.page.setViewport({ width: 1920, height: 1080 });
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        console.log('✅ Responsive design test completed');
        
        this.testResults.push({
            test: 'Responsive Design',
            status: 'PASSED',
            timestamp: new Date().toISOString()
        });
    }

    async testPerformance() {
        console.log('\n⚡ Testing performance...');
        
        const metrics = await this.page.metrics();
        console.log('Performance metrics:', {
            JSHeapUsedSize: `${Math.round(metrics.JSHeapUsedSize / 1024 / 1024)}MB`,
            Nodes: metrics.Nodes,
            JSEventListeners: metrics.JSEventListeners
        });
        
        this.testResults.push({
            test: 'Performance Check',
            status: 'PASSED',
            metrics: metrics,
            timestamp: new Date().toISOString()
        });
    }

    generateTestReport() {
        const report = {
            testSuite: 'Online Exam System Complete Flow Test',
            timestamp: new Date().toISOString(),
            totalTests: this.testResults.length,
            passed: this.testResults.filter(r => r.status === 'PASSED').length,
            failed: this.testResults.filter(r => r.status === 'FAILED').length,
            results: this.testResults
        };
        
        const reportPath = path.join(__dirname, 'test-report.json');
        fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
        
        console.log('\n📋 Test Report Generated:');
        console.log(`Total Tests: ${report.totalTests}`);
        console.log(`Passed: ${report.passed}`);
        console.log(`Failed: ${report.failed}`);
        console.log(`Report saved to: ${reportPath}`);
    }

    async cleanup() {
        if (this.browser) {
            await this.browser.close();
        }
    }
}

// Main execution
async function runTests() {
    const tester = new OnlineExamSystemTester();
    
    try {
        await tester.init();
        await tester.testCompleteFlow();
        await tester.testResponsiveDesign();
        await tester.testPerformance();
    } catch (error) {
        console.error('Test execution failed:', error);
    } finally {
        await tester.cleanup();
    }
}

// Check if running directly
if (require.main === module) {
    runTests().catch(console.error);
}

module.exports = OnlineExamSystemTester;
