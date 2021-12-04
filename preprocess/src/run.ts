import colors from "colors";
import path from "path";
import { exit } from "process";
import { readdirSync } from "fs";
import { Worker } from "worker_threads";
import { get } from "lodash";

export default function (
  // 最多同时工作的线程数
  MAX_THREADS = 20,
  // 每个线程至多分得的文件夹数量
  MAX_DIR_PER_THREADS = 100,
  // 每个线程至少分得的文件夹数量
  MIN_DIR_PER_THREADS = 10,
  mode = "pub" as "dev" | "pub"
) {
  const getPath = (
    p: string | string[],
    type: "input" | "output" = "input"
  ) => {
    const cfg = {
      dev: {
        input: "../__test_data__/input",
        output: "../__test_data__/output",
      },
      pub: {
        input: "../extract",
        output: "../dataset/src",
      },
    };
    const _ = (_p: string) => {
      return path.join(get(cfg, [mode, type]), _p);
    };

    if (Array.isArray(p)) {
      return p.map(_);
    }
    return _(p);
  };

  const sourceDir = getPath("", "input") as string;

  // 读入目录下的文件夹列表
  const dirs = readdirSync(sourceDir);

  // 每个线程分得的文件夹数量
  const dirPerThread = Math.min(
    Math.max(Math.ceil(dirs.length / MAX_THREADS), MIN_DIR_PER_THREADS),
    MAX_DIR_PER_THREADS
  );

  const tasks = Math.ceil(dirs.length / dirPerThread);

  console.log(
    colors.gray("[INFO] "),
    "\n",
    colors.blue("任务量"),
    colors.yellow(`${tasks}`),
    "\n",
    colors.blue("文件夹数量"),
    colors.yellow(`${dirs.length}`),
    "\n",
    colors.blue("最大线程数"),
    colors.yellow(`${MAX_THREADS}`),
    "\n",
    colors.blue("每个线程分得文件夹数量"),
    colors.yellow(`${dirPerThread}`)
  );

  // 先派发 MAX_THREADS 个线程，每个线程分得的文件夹数量为 MAX_DIR_PER_THREADS

  const queue = {
    _index: 0,
    _waiting: new Array(tasks)
      .fill(0)
      .map((_, i) =>
        dirs
          .slice(i * dirPerThread, (i + 1) * dirPerThread)
          .map((p) => getPath(p))
      ),
    _running: [] as Worker[],
    createWorker: function () {
      const index = ++this._index;
      return new Worker("./build/src/worker.js", {
        workerData: {
          id: `worker-${index}`,
          input: this._waiting.shift(),
          output: getPath(`${this._index}.json`, "output"),
        },
      });
    },
    add: function () {
      if (this._running.length < MAX_THREADS && this._waiting.length > 0) {
        const worker = this.createWorker();
        worker.on("message", ({ status, id }) => {
          this._running.splice(this._running.indexOf(worker), 1);
          if (this._index === tasks) {
            console.log(`${colors.green("全部完成...")}`);
            exit();
          } else {
            console.log(`${colors.green("完成: ")} ${colors.yellow(id)}}`);
            // add worker from waiting area
            this.add();
          }
        });
        this._running.push(worker);
      }
    },
    isFull() {
      return this._running.length >= MAX_THREADS;
    },
    prepare: function () {
      while (!this.isFull()) {
        this.add();
      }
    },
  };

  queue.prepare();
}
