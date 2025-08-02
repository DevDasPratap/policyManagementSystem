import os from 'os';
import env from '../config/config.js';

const INTERVAL = (Number(env.CPU_CHECK_INTERVAL) || 10) * 1000;

const checkCPU = () => {
  const cpus = os.cpus();
  const totalIdle = cpus.reduce((acc, cpu) => acc + cpu.times.idle, 0);
  const totalTick = cpus.reduce((acc, cpu) => {
    return (
      acc +
      cpu.times.user +
      cpu.times.nice +
      cpu.times.sys +
      cpu.times.irq +
      cpu.times.idle
    );
  }, 0);

  const usage = 1 - totalIdle / totalTick;
  const percent = Math.round(usage * 100);

  console.log(`CPU Usage: ${percent}%`);

  if (percent >= 70) {
    console.warn('⚠️ High CPU detected. Restarting server...');
    process.exit(1); // Let PM2 or Docker restart it
  }
};

export const startCPUMonitor = () => {
  console.log('🚀 Starting CPU monitor...');
  setInterval(checkCPU, INTERVAL);
};
