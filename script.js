/**
 * Premium Split-Screen Dashboard Logic
 * Reset-and-Reveal Presentation Mode
 */

document.addEventListener('DOMContentLoaded', () => {
    // 1. Data Definition
    const finData = {
        deposits: 22479.4,
        investment: 8092.58,
        loans: 16795.96,
        overdue: 3.38,
        grossNpa: 6.21,
        netNpa: 4.27,
        totalBusinessNum: 39255.35 
    };

    let currentTotalBusiness = finData.totalBusinessNum; // Start with the final value

    // 2. Chart Configurations
    Chart.register(ChartDataLabels);
    const ctxBusiness = document.getElementById('businessChart').getContext('2d');
    const bChart = new Chart(ctxBusiness, {
        type: 'doughnut',
        data: {
            labels: ['ठेवी (Deposits)', 'गुंतवणूक (Investment)', 'कर्ज (Loans)'],
            datasets: [{
                data: [finData.deposits, finData.investment, finData.loans],
                backgroundColor: ['#ec4899', '#06b6d4', '#f43f5e'],
                borderColor: 'rgba(255,255,255,0.1)',
                borderWidth: 2,
                hoverOffset: 30
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '75%',
            layout: { padding: 40 },
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: { color: '#94a3b8', font: { size: 16, family: 'Mukta', weight: 'bold' }, padding: 30 }
                },
                datalabels: {
                    color: '#fff',
                    font: { family: 'Outfit', size: 18, weight: '900' },
                    formatter: (value) => Math.round(value).toLocaleString() + "\nLac",
                    anchor: 'center',
                    align: 'center'
                }
            }
        },
        plugins: [{
            id: 'centerText',
            beforeDraw: (chart) => {
                const { ctx, chartArea: { top, left, width, height } } = chart;
                ctx.save();
                ctx.font = 'bold 20px Mukta';
                ctx.fillStyle = '#94a3b8';
                ctx.textAlign = 'center';
                ctx.fillText('एकूण व्यवसाय', left + width / 2, top + (height / 2) - 15);
                ctx.font = 'bold 36px Outfit';
                ctx.fillStyle = '#f59e0b';
                ctx.fillText(Math.floor(currentTotalBusiness).toLocaleString() + ' Lac', left + width / 2, top + (height / 2) + 25);
                ctx.restore();
            }
        }]
    });

    // 3. Animation Logic
    const counters = document.querySelectorAll('.counter');
    const animateValue = (element, start, end, duration, callback) => {
        let startTimestamp = null;
        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            const current = progress * (end - start) + start;
            if (element) {
                element.innerText = end % 1 === 0 ? Math.floor(current).toLocaleString() : current.toFixed(2);
            }
            if (callback) callback(current);
            if (progress < 1) window.requestAnimationFrame(step);
        };
        window.requestAnimationFrame(step);
    };

    // PHASE 1: Initial Presentation (Show targets immediately)
    counters.forEach(counter => {
        const target = parseFloat(counter.getAttribute('data-target'));
        counter.innerText = target % 1 === 0 ? target.toLocaleString() : target.toFixed(2);
    });
    document.querySelectorAll('.progress-bar').forEach(bar => {
        bar.style.width = bar.style.getPropertyValue('--final-width');
    });

    const runPresentationCycle = () => {
        // RESET instantly to 0
        currentTotalBusiness = 0;
        bChart.draw();
        counters.forEach(c => c.innerText = "0");
        document.querySelectorAll('.progress-bar').forEach(b => b.style.width = "0%");

        // FAST RE-ANIMATE back to targets
        setTimeout(() => {
            counters.forEach((counter, idx) => {
                const target = parseFloat(counter.getAttribute('data-target'));
                setTimeout(() => animateValue(counter, 0, target, 1200), idx * 50); 
            });

            animateValue(null, 0, finData.totalBusinessNum, 1200, (val) => {
                currentTotalBusiness = val;
                bChart.draw();
            });

            document.querySelectorAll('.progress-bar').forEach(bar => {
                bar.style.width = bar.style.getPropertyValue('--final-width');
            });
        }, 300);
    };

    // START PERPETUAL LOOP: Every 10 seconds, reset and re-reveal
    setInterval(runPresentationCycle, 10000);
});
