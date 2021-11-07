import path from "path";
import { readdirSync, readFileSync, writeFileSync } from "fs";
import { Worker } from "worker_threads";
import { exit } from "process";

export default function (
  input = "../extract",
  output = "../dataset/data.json",
  // 每个线程分到的文件夹数量
  MAX_THREADS = 20,
  // 每个线程至少分得的文件夹数量
  MIN_DIR_PER_THREADS = 10
) {
  // 读入目录下的文件夹列表
  const dirs = readdirSync(input);

  // 每个线程分得的文件夹数量
  const dirPerThread = Math.max(
    Math.ceil(dirs.length / MAX_THREADS),
    MIN_DIR_PER_THREADS
  );

  const workers = [];
  for (let i = 0; i < MAX_THREADS; i++) {
    const st = i * dirPerThread;
    const end = (i + 1) * dirPerThread;
    if (st < dirs.length) {
      workers[i] = new Worker("./build/src/worker.js", {
        workerData: {
          id: `worker-${i}`,
          input: dirs
            .slice(st, end)
            // ../__test_data__/input  in test mode
            // ../extract
            .map((p) => path.join("../extract", p)),
        },
      });
    }
  }

  let counter = 0;
  workers.forEach((worker) => {
    worker.on("message", (data) => {
      // read file from output
      let dataset: string[] = [];
      try {
        dataset = JSON.parse(readFileSync(output, "utf-8"));
      } catch (e) {}
      dataset.push(...data);
      writeFileSync(output, JSON.stringify(dataset, null, 2));
      counter++;
      if (counter === workers.length) {
        console.log("处理完成...");
        exit();
      }
    });
  });
}
