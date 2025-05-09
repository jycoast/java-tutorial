# 从一个会产生线程安全问题的例子开始

观察下面的程序，你觉得程序输出的结果会是什么？

```java
public class Counter {

    private int count = 0;

    public void increment() {
        count++;
    }

    public int getCount() {
        return count;
    }

    public static void main(String[] args) throws InterruptedException {
        Counter counter = new Counter();
        Runnable task = () -> {
            for (int i = 0; i < 1000; i++) {
                counter.increment();
            }
        };

        Thread t1 = new Thread(task);
        Thread t2 = new Thread(task);
        t1.start();
        t2.start();

        // 等待两个线程执行完
        t1.join();
        t2.join();

        System.out.println("最终计数: " + counter.getCount()); // 期待输出 2000
    }
}
```

你可能会脱口而出，2000。但是多运行几次这个程序，你就会发现，结果可能不是2000，而像是一个随机值，这就是线程安全问题。程序在多线程的情况下，运行的结果产生了错误。