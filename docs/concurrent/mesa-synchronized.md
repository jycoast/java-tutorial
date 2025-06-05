# 锁的使用

众所周知，Jvm中有两种线程同步方案：synchronized 和 Lock。那么这两种不同的实现方案到底有什么本质区别，又有什么联系呢？

## synchronized 的使用

```java
public class Counter {

    private int count = 0;

    // 同步方法
//    public synchronized void increment() {
//        count++;
//    }

    // 非同步方法
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

        System.out.println("最终计数: " + counter.getCount()); // 期望输出 2000
    }
}
```

synchronized使用场景：

| 使用场景     | 锁对象      | 适用情况                       |
| ------------ | ----------- | ------------------------------ |
| 同步方法     | this        | 保护整个实例方法               |
| 同步代码块   | 自定义对象  | 保护部分代码，灵活性更高       |
| 同步静态方法 | Class 对象  | 保护类级别的静态资源           |
| 同步类对象   | Class 对象  | 在实例方法中保护静态资源       |
| 同步不同实例 | 各自的 this | 实例级独立同步，不干扰其他实例 |

## Lock 的使用

```java

public class Counter {

    private static final ReentrantLock lock = new ReentrantLock();

    private int count = 0;

    public void increment() {
        lock.lock();
        try {
            count++;
        } finally {
            lock.unlock();
        }
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

        System.out.println("最终计数: " + counter.getCount()); // 输出 2000
    }
}
```

## CAS 的使用

CAS 是一种无锁的原子操作：只有当某个值等于预期值时，才将其更新为新值。

```java
if (内存中的值 == 期望值) {
    更新为新值；
    返回 true；
} else {
    不更新；
    返回 false；
}
```

例如：

```java
AtomicInteger atomicInt = new AtomicInteger(0);
boolean success = atomicInt.compareAndSet(0, 1); // 如果当前值是0，则更新为1
```

通常会被自旋重试，直到成功：：

```java
while (!compareAndSwap(expected, newValue)) {
    expected = getCurrent(); // 重新获取
}
```

java源码：AbstractQueuedSynchronizer#compareAndSetState

CAS的优点：在多线程环境下减少上下文切换和阻塞。

# 锁的本质
这里先对锁的本质进行定义，下面会详细讨论：

锁的本质：对共享变量原子性的进行修改，记录是否获取锁的状态。

## MESA 模型

Mesa 模型通常与 Xerox PARC 在 20 世纪 70 年代开发的 Mesa 编程语言相关联，它引入了一种经典的线程同步和并发控制方法，尤其是在**监视器（Monitor）**的基础上进行改进。这个模型对后来的编程语言（如 Java）和并发理论有深远影响。

![image-20250113231336199](https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/202504071514720.png)

>管程：指的是管理共享变量以及对共享变量的操作过程，让他们支持并发，管理类的成员变量和成员方法，让这个类是线程安全的。

管程的理解：https://freegeektime.com/100023901/86089/

###  MESA 模型的背景

监视器（Monitor）基础

- 监视器是一种高级同步原语，包含共享数据和操作这些数据的同步方法。
- 它通过互斥锁（Mutex）和条件变量（Condition Variable）实现线程间的同步。

Mesa 的改进

在早期的监视器实现（如 Hoare 模型）中，条件变量的信号传递（signal）会导致线程立即切换，而 Mesa 模型引入了更灵活的机制，称为“非立即切换”模型。

### MESA 模型的核心特点
Mesa 模型在并发控制中的关键特性包括：

(1) “Signal-and-Continue” 机制

- 在 Mesa 模型中，当一个线程通过条件变量发出信号（signal）时，它不会立即将控制权交给等待的线程，而是继续执行。
- 等待的线程被唤醒后，必须重新检查条件（因为条件可能在信号发出后又被修改）。

与 Hoare 模型的对比

- **Hoare 模型**：信号发出后，控制权立即交给等待线程，发出信号的线程被挂起。
- **Mesa 模型**：信号只是通知，发出信号的线程继续运行，等待线程稍后竞争锁。

示例伪代码

```java
monitor MesaExample {
    boolean resourceAvailable = false;

    // 等待资源
    procedure waitForResource() {
        while (!resourceAvailable) {
            wait(); // 等待条件变量
        }
        // 使用资源
    }

    // 释放资源
    procedure releaseResource() {
        resourceAvailable = true;
        signal(); // 发出信号但继续执行
    }
}
```
**关键点**：`waitForResource` 中的 `while` 循环是 Mesa 模型的标志，因为线程被唤醒后必须重新检查条件。

(2) 条件变量的灵活性

- Mesa 模型允许使用多个条件变量来管理复杂的同步需求。
- 每个条件变量可以关联不同的等待条件，提高并发控制的表达能力。

(3) 互斥与同步分离

- Mesa 模型将互斥（通过锁实现）和同步（通过条件变量实现）明确分开，使得代码更模块化。

### MESA  模型适的使用场景
Mesa 模型适用于需要精细控制线程同步的并发系统。以下是几个典型场景：

(1) 生产者-消费者问题

生产者生成数据，消费者消费数据，中间通过缓冲区协调。
```java
class BoundedBuffer {
    private int[] buffer;
    private int count = 0;
    private final Object lock = new Object();

    public BoundedBuffer(int size) {
        buffer = new int[size];
    }

    public void produce(int item) throws InterruptedException {
        synchronized (lock) {
            while (count == buffer.length) { // 缓冲区满
                lock.wait(); // 等待消费者消费
            }
            buffer[count++] = item;
            lock.notify(); // 通知消费者，但生产者继续执行
        }
    }

    public int consume() throws InterruptedException {
        synchronized (lock) {
            while (count == 0) { // 缓冲区空
                lock.wait(); // 等待生产者生产
            }
            int item = buffer[--count];
            lock.notify(); // 通知生产者，但消费者继续执行
            return item;
        }
    }
}
```
- **Mesa 特性**：使用 `while` 检查条件，`notify` 不会立即切换线程。

(2) 读写锁问题

多个线程需要读数据，但写操作需要独占访问。
```java
class ReadWriteLock {
    private int readers = 0;
    private boolean writer = false;
    private final Object lock = new Object();

    public void startRead() throws InterruptedException {
        synchronized (lock) {
            while (writer) {
                lock.wait(); // 等待写者完成
            }
            readers++;
        }
    }

    public void endRead() {
        synchronized (lock) {
            readers--;
            if (readers == 0) {
                lock.notifyAll(); // 通知写者
            }
        }
    }

    public void startWrite() throws InterruptedException {
        synchronized ( volunteerslock) {
            while (readers > 0 || writer) {
                lock.wait(); // 等待读者和写者
            }
            writer = true;
        }
    }

    public void endWrite() {
        synchronized (lock) {
            writer = false;
            lock.notifyAll(); // 通知所有等待线程
        }
    }
}
```
- **Mesa 特性**：线程被唤醒后重新检查条件（如 `readers > 0 || writer`）。

###  MESA 模型与现代技术的联系
Mesa 模型直接影响了现代编程语言的并发机制：
- **Java**：Java 的 `synchronized`、`wait()`、`notify()` 和 `notifyAll()` 直接采用了 Mesa 模型的“Signal-and-Continue”语义。
- **C#**：`Monitor` 类（如 `Monitor.Wait` 和 `Monitor.Pulse`）也遵循类似设计。
- **操作系统**：许多操作系统的线程库（如 POSIX 线程中的条件变量）借鉴了 Mesa 的思想。

为什么选择 Mesa 模型？

- **实现简单**：无需复杂的线程切换逻辑。
- **灵活性**：允许线程在发出信号后完成自己的工作。
- **健壮性**：通过显式的条件检查避免虚假唤醒（spurious wakeup）。

### MESA 模型总结
Mesa 模型是一种经典的并发控制机制，以其“Signal-and-Continue”和显式条件检查为核心，广泛应用于现代编程语言和系统中。它通过监视器和条件变量提供了线程安全的保障，尤其适合生产者-消费者、资源竞争等场景。

## synchronized、Lock 与 MESA模型

| 功能/概念          | `synchronized`                        | `Lock`（如 `ReentrantLock`）                   | MESA 模型                          | 说明                           |
| ------------------ | ------------------------------------- | ---------------------------------------------- | ---------------------------------- | ------------------------------ |
| **互斥锁获取**     | 隐式（进入 `synchronized` 块/方法时） | `lock()`                                       | 进入临界区（enter monitor）        | 控制对共享资源的互斥访问       |
| **互斥锁释放**     | 隐式（方法或代码块执行完自动释放）    | `unlock()`                                     | 离开临界区（exit monitor）         | 防止死锁需手动释放 Lock        |
| **等待条件**       | `wait()`（需在同步块中使用）          | `await()`（需结合 `Condition` 使用）           | `wait`（进入等待队列，释放锁）     | 条件等待机制                   |
| **唤醒线程**       | `notify()` / `notifyAll()`            | `signal()` / `signalAll()`                     | `signal`（从等待队列移到就绪队列） | 通知等待线程资源可能可用       |
| **条件对象**       | 无独立条件对象（隐式绑定 monitor）    | `Condition`（通过 `Lock.newCondition()` 获取） | 等待队列（condition queue）        | 每个条件可对应一个等待队列     |
| **可重入性**       | 支持（可重入监视器锁）                | `ReentrantLock` 支持可重入                     | 支持                               | 同一个线程可以多次获取同一把锁 |
| **中断响应**       | `wait()` 可被中断                     | `await()` 可中断                               | `wait` 可中断                      | 支持对等待线程进行中断控制     |
| **是否必须释放锁** | 自动（离开 `synchronized` 代码块）    | 必须手动释放（使用 try-finally 推荐）          | 手动                               | Lock 更灵活，但更易出错        |

## synchronized 锁住的是什么？

synchronized 锁的是**对象**（而不是代码本身），具体来说是某个对象的**监视器 (monitor)**。

每个 Java 对象都有一个与之关联的监视器（monitor），它是一个内部的锁结构，用于协调多线程访问。当一个线程进入 synchronized 块时，它必须先获取该对象的监视器，执行完后释放监视器。

### 监视器

#### 监视器和字节码

以如下代码为例：

```java
public class SynchronizedTest {

    private static final Object object = new Object();

    public static void main(String[] args) {
        synchronized (object) {
            System.out.println("synchronized 代码块");
        }
    }
}

```

这个类的字节码：

```java
Classfile /SynchronizedTest.class
  Last modified Apr 7, 2025; size 542 bytes
  MD5 checksum ...
public class SynchronizedTest
  minor version: 0
  major version: 61
  flags: (0x0021) ACC_PUBLIC, ACC_SUPER

Constant pool:
   #1 = Class              #7             // SynchronizedTest
   #2 = Fieldref           #1.#8          // SynchronizedTest.object:Ljava/lang/Object;
   #3 = Fieldref           #9.#10         // java/lang/System.out:Ljava/io/PrintStream;
   #4 = String             #11            // synchronized 代码块
   #5 = Methodref          #12.#13        // java/io/PrintStream.println:(Ljava/lang/String;)V
   #6 = Class              #14            // java/lang/Object
   #7 = Utf8               SynchronizedTest
   #8 = NameAndType        #15:#16        // object:Ljava/lang/Object;
   #9 = Class              #17            // java/lang/System
  #10 = NameAndType        #18:#19        // out:Ljava/io/PrintStream;
  #11 = Utf8               synchronized 代码块
  #12 = Class              #20            // java/io/PrintStream
  #13 = NameAndType        #21:#22        // println:(Ljava/lang/String;)V
  #14 = Utf8               java/lang/Object
  #15 = Utf8               object
  #16 = Utf8               Ljava/lang/Object;
  #17 = Utf8               java/lang/System
  #18 = Utf8               out
  #19 = Utf8               Ljava/io/PrintStream;
  #20 = Utf8               java/io/PrintStream
  #21 = Utf8               println
  #22 = Utf8               (Ljava/lang/String;)V
  ...

{
  private static final java.lang.Object object;
    descriptor: Ljava/lang/Object;
    flags: (0x001a) ACC_PRIVATE, ACC_STATIC, ACC_FINAL

  static {};
    Code:
       0: new           #6                  // class java/lang/Object
       3: dup
       4: invokespecial #23                 // Method java/lang/Object."<init>":()V
       7: putstatic     #2                  // Field object:Ljava/lang/Object;
      10: return
    LineNumberTable:
      line 3: 0

  public static void main(java.lang.String[]);
    descriptor: ([Ljava/lang/String;)V
    flags: (0x0009) ACC_PUBLIC, ACC_STATIC
    Code:
       0: getstatic     #2                  // Field object:Ljava/lang/Object;
       3: dup
       4: astore_1
       5: monitorenter
       6: getstatic     #3                  // Field java/lang/System.out:Ljava/io/PrintStream;
       9: ldc           #4                  // String synchronized 代码块
      11: invokevirtual #5                  // Method java/io/PrintStream.println:(Ljava/lang/String;)V
      14: aload_1
      15: monitorexit
      16: goto          24
      19: astore_2
      20: aload_1
      21: monitorexit
      22: aload_2
      23: athrow
      24: return
    Exception table:
       from    to  target type
           5    16    19   any
    LineNumberTable:
      line 6: 0
      line 7: 6
      line 8: 14
      line 9: 24
    LocalVariableTable:
      Start  Length  Slot  Name   Signature
          0      25     0  args   [Ljava/lang/String;
          5      20     1   obj   Ljava/lang/Object;

}
```

JVM 在底层通过 **monitorenter** 和 **monitorexit** 指令实现 synchronized 的同步机制。这些指令操作对象的监视器。下面是原理的简化和对应的伪代码解释：

- 当线程进入 synchronized (object) 时：
  1. 执行 monitorenter 指令，尝试获取 object 的监视器。
  2. 如果监视器未被占用，线程成功获取并进入代码块。
  3. 如果监视器已被其他线程持有，当前线程阻塞等待。
- 当线程离开 synchronized 块时：
  1. 执行 monitorexit 指令，释放 object 的监视器。
  2. 其他等待的线程可以竞争获取监视器。

监视器的C++代码：

```c++
class ObjectMonitor {
private:
    volatile intptr_t _header;         // 对象头的 Mark Word
    void* _object;                     // 指向被锁的 Java 对象
    pthread_mutex_t _mutex;            // 互斥锁，用于保护监视器
    pthread_cond_t _cond;              // 条件变量，用于线程等待和唤醒
    Thread* _owner;                    // 当前持有锁的线程
    ObjectWaiter* _waiters;            // 等待队列（等待锁的线程）
    int _recursions;                   // 重入次数（支持锁重入）

public:
    ObjectMonitor() {
        _header = 0;
        _object = nullptr;
        _owner = nullptr;
        _waiters = nullptr;
        _recursions = 0;
        pthread_mutex_init(&_mutex, nullptr);
        pthread_cond_init(&_cond, nullptr);
    }

    ~ObjectMonitor() {
        pthread_mutex_destroy(&_mutex);
        pthread_cond_destroy(&_cond);
    }

    void enter(Thread* self);          // 进入监视器（获取锁）
    void exit(Thread* self);           // 退出监视器（释放锁）
    void wait(Thread* self);           // 等待
    void notify(Thread* self);         // 通知一个等待线程
    void notifyAll(Thread* self);      // 通知所有等待线程
};
```

**字段说明**：

- _mutex：互斥锁，确保同一时刻只有一个线程操作监视器。
- _cond：条件变量，用于实现 wait() 和 notify() 的等待/唤醒机制。
- _owner：记录当前持有锁的线程。
- _recursions：支持锁的可重入性（同一个线程可以多次获取锁）。
- _waiters：等待队列，存储因锁竞争而阻塞的线程。

#### 监视器池

当 synchronized 锁升级为重量级锁时，JVM 需要一个机制来管理锁的竞争，包括记录持有锁的线程、维护等待队列、处理线程的阻塞和唤醒等。由于锁竞争可能发生在多个对象上，JVM 不可能为每个对象都预先分配一个完整的监视器结构（内存开销太大）。因此，JVM 使用一个 **ObjectMonitor 池** 来动态分配和重用监视器对象，以优化内存使用和性能。

在 HotSpot JVM 中，ObjectMonitor 是一个 C++ 类，定义在 `hotspot/src/share/vm/runtime/objectMonitor.hpp` 和 objectMonitor.cpp 中。JVM 通过一个池（或类似的内存管理机制）来维护这些 ObjectMonitor 实例。

#### 监视器池的实现

- 全局池：JVM 维护一个全局的 ObjectMonitor 池，通常是一个链表或类似的数据结构，用于存储空闲的 ObjectMonitor 实例。

  - 在源码中，这由 ObjectSynchronizer 类管理（位于 synchronizer.cpp）。

  - 示例字段（简化）：

    ```C++
    static ObjectMonitor* gFreeMonitorList; // 空闲监视器链表
    static volatile intptr_t gMonitorFreeCount; // 空闲监视器数量
    ```

- **初始化**：

  - JVM 启动时会预分配一定数量的 ObjectMonitor 实例，放入空闲池中。
  - 数量通常由 JVM 参数（如 -XX:MonitorBound）控制，默认值取决于系统资源。

  **动态分配**：

  - 当需要新的 ObjectMonitor 时，JVM 从池中取出一个空闲实例。
  - 如果池为空，则动态分配一个新的实例（通过 new ObjectMonitor()）并初始化。

  **回收**：

  - 当锁释放且不再需要某个 ObjectMonitor 时，它会被清理并放回池中，以便重用。

#### 为Java对象分配监视器

##### 检查锁状态

- JVM 检查目标对象（如 MyClass.class）的 Mark Word。
- 如果是轻量级锁且竞争加剧，进入锁膨胀流程。

##### 从监视器池中获取监视器

- 调用 ObjectSynchronizer::inflate：

  ```c++
  ObjectMonitor* ObjectSynchronizer::inflate(oop obj) {
      if (gFreeMonitorList != NULL) {
          // 从空闲池中取出一个监视器
          ObjectMonitor* monitor = gFreeMonitorList;
          gFreeMonitorList = monitor->next_free();
          gMonitorFreeCount--;
          monitor->recycle(); // 重置状态
          return monitor;
      } else {
          // 池为空，分配新实例
          return new ObjectMonitor();
      }
  }
  ```

- 参数 obj 是被锁的 Java 对象（这里是 MyClass.class）。

> inflate 这个单词是膨胀的意思

##### 初始化监视器

- 将 ObjectMonitor 的 _object 字段设置为 MyClass.class 的指针。
- 清空 _owner、_EntryList 等字段，准备接收线程。

##### 将 ObjectMonitor 地址写入 Mark Word

在分配 ObjectMonitor 后，JVM 需要将其地址与 Class 对象关联起来，这一过程通过更新 Mark Word 完成。

Mark Word 与监视器

Mark Word 是一个动态结构，其内容根据锁状态变化：

- **无锁**：存储哈希码或 GC 信息。
- **偏向锁**：存储线程 ID 和偏向标志。
- **轻量级锁**：指向线程栈中的锁记录。
- **重量级锁**：存储指向 ObjectMonitor 的指针。

在 64 位 JVM 中，Mark Word 通常是 64 位，格式如下（简化）：

```text
|-----------------------------------------------|
| 锁状态 | 内容                                      |
|--------|------------------------------------------|
| 无锁   | hash:31 | age:4 | 0 | 01                |
| 偏向锁 | thread:54 | epoch:2 | 1 | 01            |
| 轻量级 | ptr_to_lock_record:62 | 00              |
| 重量级 | ptr_to_monitor:62 | 10                  |
|-----------------------------------------------|
```

- **重量级锁状态**：最后两位是 10，其余位存储 ObjectMonitor 的地址。

**写入Mark Word过程**

1. 锁膨胀：

   - ObjectSynchronizer::inflate 返回 ObjectMonitor 实例后，JVM 更新 Mark Word。

   - 示例代码（简化）：

     ```c++
     void inflate_and_associate(oop obj, ObjectMonitor* monitor) {
         markOop mark = obj->mark(); // 获取当前 Mark Word
         if (mark->is_neutral()) {   // 无锁状态
             markOop new_mark = (markOop)(monitor | WEIGHTED_LOCK_FLAG);
             if (Atomic::cmpxchg_ptr(new_mark, obj->mark_addr(), mark) == mark) {
                 monitor->set_object(obj); // 关联对象
             }
         } else if (mark->has_locker()) { // 轻量级锁
             // 撤销轻量级锁，更新为重量级锁
             markOop new_mark = (markOop)(monitor | WEIGHTED_LOCK_FLAG);
             Atomic::cmpxchg_ptr(new_mark, obj->mark_addr(), mark);
         }
     }
     ```

   - 使用 CAS（cmpxchg_ptr）原子地将 ObjectMonitor 地址写入 Mark Word。

2. 标志位设置：

   - 将 Mark Word 的低两位设置为 10，表示重量级锁。
   - 高位存储 ObjectMonitor 的内存地址。

3. 关联完成：

   - 此时，MyClass.class 的 Mark Word 指向 ObjectMonitor，线程通过该指针访问监视器。

##### 监视器的后续管理

- 线程竞争：
  - 第一个线程获取锁，ObjectMonitor 的 _owner 设置为该线程。
  - 其他线程加入 _EntryList，通过 pthread_mutex_t 和 futex 阻塞。
- 锁释放：
  - 线程退出 synchronized 块，调用 monitorexit。
  - JVM 检查 _recursions，若为 0，则释放 ObjectMonitor，唤醒 _EntryList 中的线程。
- 回收：
  - 如果 ObjectMonitor 不再需要，JVM 将其放回空闲池（gFreeMonitorList）。

### pthread_mutex_t

pthread_mutex_t 是 POSIX 线程库 (Pthreads) 提供的一种互斥锁类型，用于在多线程程序中实现同步。它的源码实现依赖于具体的操作系统和 C 库（如 glibc 或 musl），通常是用 C 语言编写，并结合底层系统调用（如 Linux 的 futex）实现的。由于 Pthreads 是标准接口，其具体实现因平台而异，这里以 Linux 上 glibc 的实现为例。

在 glibc（GNU C Library）中，pthread_mutex_t 是一个结构体，定义在 pthread.h 或相关的内部头文件中。以下是其简化形式（基于 glibc 2.34 的源码，路径如 nptl/sysdeps/pthread/pthread.h）：

```c
typedef union {
    struct __pthread_mutex_s {
        int __lock;           // 锁的状态（0 表示未锁，>0 表示已锁）
        unsigned int __count; // 重入计数（对于递归锁）
        int __owner;          // 持有锁的线程 ID
        unsigned int __nusers;// 使用计数（调试用）
        int __kind;           // 锁的类型（普通、递归、错误检查等）
        short __spins;        // 自旋计数（优化用）
        short __elision;      // 锁消除标志（硬件优化）
        __pthread_list_t __list; // 等待队列（指向等待线程）
    } __data;
    char __size[__SIZEOF_PTHREAD_MUTEX_T]; // 固定大小的字节数组
    long int __align;                      // 对齐用
} pthread_mutex_t;
```

**字段说明**：

- __lock：核心锁状态，通常与 futex 系统调用交互。
- __count：记录重入次数（仅对递归锁有效）。
- __owner：记录持有锁的线程 ID（用于调试或错误检查锁）。
- __kind：锁的类型（PTHREAD_MUTEX_NORMAL、PTHREAD_MUTEX_RECURSIVE 等）。
- __list：等待队列，用于阻塞等待的线程。
- __size：确保结构体大小和内存对齐。
- __align：确保结构体大小和内存对齐。

### pthread_mutex_lock

pthread_mutex_lock是pthread中的函数。

```C++
int pthread_mutex_lock(pthread_mutex_t *mutex) {
    struct __pthread_mutex_s *imutex = &mutex->__data;
    pid_t tid = gettid(); // 获取当前线程 ID

    // 检查锁类型并处理重入
    if (imutex->__kind == PTHREAD_MUTEX_RECURSIVE && imutex->__owner == tid) {
        imutex->__count++;
        return 0;
    }

    // 快速路径：尝试获取锁
    if (atomic_compare_and_swap(&imutex->__lock, 0, 1) == 0) {
        imutex->__owner = tid;
        imutex->__count = 1;
        return 0;
    }

    // 慢路径：锁被占用，使用 futex 等待
    while (atomic_compare_and_swap(&imutex->__lock, 1, 2) != 0) {
        // 这里说的就是内核态
        syscall(SYS_futex, &imutex->__lock, FUTEX_WAIT, 2, NULL, NULL, 0);
    }

    // 成功获取锁
    imutex->__lock = 1;
    imutex->__owner = tid;
    imutex->__count = 1;
    return 0;
}
```

- 逻辑
  1. **快速路径**：通过原子操作（CAS）尝试将 __lock 从 0 改为 1，若成功则获取锁。
  2. **慢路径**：如果锁被占用，进入竞争状态，使用 futex 系统调用阻塞线程。
  3. **重入支持**：对于递归锁，检查线程 ID 并增加 __count。

### pthread_mutex_unlock

```c++
int pthread_mutex_unlock(pthread_mutex_t *mutex) {
    struct __pthread_mutex_s *imutex = &mutex->__data;
    pid_t tid = gettid();

    // 检查是否为持有者
    if (imutex->__owner != tid) {
        return EPERM; // 权限错误
    }

    // 处理重入
    if (imutex->__kind == PTHREAD_MUTEX_RECURSIVE && --imutex->__count > 0) {
        return 0;
    }

    // 释放锁
    imutex->__owner = 0;
    imutex->__count = 0;
    if (atomic_swap(&imutex->__lock, 0) == 2) {
        // 如果有等待者，唤醒一个线程
        syscall(SYS_futex, &imutex->__lock, FUTEX_WAKE, 1, NULL, NULL, 0);
    }

    return 0;
}
```

### futex

**什么是 futex**？

`futex` 的全称是 **Fast Userspace Mutex**，它是 Linux 系统中的一个**系统调用接口**，可以通过 `syscall` 访问，属于 Linux 提供给用户态线程库、语言运行时（JVM、glibc、Go runtime等）用来实现锁的**底层原语**。

当在用户态调用 `syscall(SYS_futex, ...)` 后，操作系统都做了些什么事？

```text
用户程序
   |
   | syscall(SYS_futex, ...)
   ↓
CPU 切换到内核态（特权级 0）
   ↓
内核根据 syscall 编号查找对应函数（如 sys_futex）
   ↓
执行 futex 内核代码（内核栈、调度、睡眠、唤醒等）
   ↓
返回结果，切换回用户态
```

### 通过监视器获取锁

监视器获取锁：

```c++
void ObjectMonitor::enter(Thread* self) {
    // 如果当前线程已经是持有者，增加重入计数
    if (_owner == self) {
        _recursions++;
        return;
    }

    // 尝试获取互斥锁
    pthread_mutex_lock(&_mutex);

    // 如果锁未被占用，设置当前线程为持有者
    if (_owner == nullptr) {
        _owner = self;
        _recursions = 1;
    } else {
        // 锁被占用，将当前线程加入等待队列并阻塞
        ObjectWaiter waiter(self);
        _waiters->append(&waiter);
        pthread_cond_wait(&_cond, &_mutex); // 等待被唤醒
    }

    pthread_mutex_unlock(&_mutex);
}
```

**逻辑**：

1. 检查是否重入：如果是当前线程，直接增加 _recursions。
2. 使用 pthread_mutex_lock 保护操作。
3. 如果锁空闲，占有锁；否则加入等待队列并阻塞。

```c++
void ObjectMonitor::exit(Thread* self) {
    pthread_mutex_lock(&_mutex);

    // 确保是持有者调用
    if (_owner != self) {
        pthread_mutex_unlock(&_mutex);
        throw "IllegalMonitorStateException";
    }

    // 减少重入计数
    _recursions--;
    if (_recursions == 0) {
        _owner = nullptr; // 完全释放锁
        if (_waiters != nullptr) {
            // 唤醒一个等待线程
            ObjectWaiter* waiter = _waiters->removeFirst();
            pthread_cond_signal(&_cond);
        }
    }

    pthread_mutex_unlock(&_mutex);
}
```

**逻辑**：

1. 检查调用者是否持有锁。
2. 减少重入计数，若为 0，则释放锁并唤醒等待队列中的线程。

## Lock 锁住的是什么？

AQS中的共享变量`state`：

```java
public abstract class AbstractQueuedSynchronizer {
    private volatile int state;
}
```

# 如何实现CAS？

## 硬件实现CAS

__atomic_compare_exchange_n 是编译器内置函数，其实现依赖于硬件指令：

- x86/x86_64：使用 cmpxchg（Compare and Exchange）指令。

  - 示例汇编：

    ```asm
    mov eax, [expected]    ; 加载期望值
    lock cmpxchg [ptr], desired ; 比较并交换
    ```

- **ARM**：使用 ldrex 和 strex（Load-Exclusive 和 Store-Exclusive）指令对。

- **编译器生成**：GCC 根据目标架构自动生成对应的原子指令。

不是所有的硬件都天然支持原子指令，尤其是早期的简单处理器或某些嵌入式系统。不过，现代通用处理器（如 x86、ARM、RISC-V 等）通常都提供原子指令支持，因为多线程和并发编程的需求日益增加。如果硬件不支持原子指令，__atomic_compare_exchange_n 等原子操作的实现需要依赖软件模拟或操作系统支持。

 **硬件是否都提供原子指令？**

- 支持原子指令的硬件：
  - **x86/x86_64**：提供 cmpxchg（Compare and Exchange）、lock 前缀等指令。
  - **ARM**：提供 ldrex/strex（Load-Exclusive/Store-Exclusive）指令对（ARMv6 及以上）。
  - **RISC-V**：提供原子扩展（A 扩展），包括 amo（Atomic Memory Operation）指令。
  - **PowerPC**：提供 lwarx/stwcx（Load and Reserve/Store Conditional）。
- 不支持原子指令的硬件：
  - 早期的简单处理器（如 8086、某些 8 位微控制器）没有原生的原子指令。
  - 一些低端嵌入式系统（如老式 AVR 或 PIC 微控制器）缺乏硬件支持。
  - 某些特殊用途处理器可能故意省略复杂指令以简化设计。
- **趋势**：现代处理器几乎都支持原子指令，因为多核和并发是标配。但在极低功耗或极简设计的场景中，硬件可能不提供。

 **硬件支持原子指令时的实现**

当硬件提供原子指令时，__atomic_compare_exchange_n 直接映射到这些指令：

- x86 示例：

  ```asm
  mov eax, [expected]         ; 加载期望值
  lock cmpxchg [ptr], desired ; 原子比较并交换
  setz al                    ; 设置返回值（成功为 1，失败为 0）
  ```

  lock 确保操作不可中断。

- ARM 示例：

  ```asm
  ldrex r1, [ptr]         ; 加载当前值
  cmp r1, expected        ; 比较
  bne fail                ; 不相等则失败
  strex r2, desired, [ptr]; 尝试存储新值
  cmp r2, #0              ; 检查是否成功
  beq success             ; 成功跳转
  fail:
  ```

这种实现效率高，直接利用硬件的原子性。

## 软件模拟实现CAS

**硬件不支持原子指令时，__atomic_compare_exchange_n 如何实现？**

如果硬件没有原子指令，GCC 或其他编译器需要通过软件手段模拟原子性。以下是可能的实现方式：

示例方法 ：忙等待（自旋锁，简单但低效）

- **思路**：通过循环检查和修改变量，模拟原子性。

- 伪代码：

  ```c
  static volatile int spinlock = 0;
  
  bool __atomic_compare_exchange_n(int *ptr, int *expected, int desired,
                                   bool weak, int success_memorder, int failure_memorder) {
      while (spinlock != 0) {} // 忙等待
      spinlock = 1;            // 获取锁
      bool success = false;
      if (*ptr == *expected) {
          *ptr = desired;
          success = true;
      } else {
          *expected = *ptr;
      }
      spinlock = 0;            // 释放锁
      return success;
  }
  ```

- **缺点**：效率低下，浪费 CPU 资源，仅适用于简单场景。

## 硬件如何保障原子性的？

###  原子性的硬件实现：三大关键机制

#### 原子指令（Atomic Instructions）

 x86 示例：`LOCK CMPXCHG`

```asm
LOCK CMPXCHG [mem], reg
```

- `CMPXCHG`: 比较并交换
- `LOCK` 前缀：**告诉 CPU 保证这个指令是原子的**
- CPU 会自动协调以下：
  - 禁止其他核心访问目标地址所在缓存行
  - 保证整个操作不可中断（包括异常或中断）

 ARM 示例：`LDREX` / `STREX`

- `LDREX`：加载一个值并设置“本地监视器”
- `STREX`：尝试写入，如果期间该地址被其他核修改，则写入失败
- 这是一种乐观锁 + 回退机制，通常配合自旋使用

#### 总线锁（Bus Locking）机制（较早期）

早期 CPU 使用一种粗暴方式来实现原子性：

- 在执行带 `LOCK` 的指令时，**锁住整个内存总线**
- 其他 CPU 在此期间无法发出内存访问请求
- 实现方式：
  - 设置 `LOCK#` 引脚，阻止其他核访问共享内存

 缺点：影响整个平台的并发性能。

#### 缓存一致性协议（MESI）

现代多核 CPU 更优雅地用缓存系统配合原子指令：

 什么是 MESI 协议？

- 一种多核处理器缓存一致性协议，保证各核心缓存的数据一致
- 每个缓存行的状态有 4 种：
  - **M**odified（已修改）
  - **E**xclusive（独占）
  - **S**hared（共享）
  - **I**nvalid（失效）

原子性通过“缓存行独占”实现

- 原子指令（如 `LOCK CMPXCHG`）执行时，会：
  1. 把目标地址所在的**缓存行标记为“独占”或“已修改”**
  2. 临时禁止其他核心读写此缓存行（通过总线探测或总线广播）
  3. 确保操作完成前没有人能访问

所以：**现代 CPU 不再锁总线，而是锁缓存行，提高了并发性能。**

###  示例：一次 CAS 的原子流程（现代 CPU）

假设有两个核心同时执行：

```java
compareAndSwap(address, expected, newValue)
```

**核心 A 的流程：**

1. 从内存把 `address` 处的值读到本地缓存
2. 用 `LOCK CMPXCHG` 尝试更新值
3. CPU 使用缓存一致性协议通知其他核**"我要独占这行缓存"**
4. 其他核心必须让出该缓存行（失效状态）
5. 核心 A 修改完成后，写入主内存（或延迟写）

如果期间有其他核也尝试修改，就会失败（触发重试）


### 关键支持技术（背后的底层机制）

| 技术                       | 作用说明                        |
| -------------------------- | ------------------------------- |
| 原子指令（如 CMPXCHG）     | 执行原子读-比较-写              |
| LOCK 前缀                  | 确保缓存一致性协议激活          |
| 总线锁（老机制）           | 临时阻断其他访问                |
| MESI 协议                  | 保证各核心对缓存一致理解        |
| 内存屏障（Memory Barrier） | 防止 CPU 指令重排序打乱操作顺序 |
| 本地监视器（ARM）          | 检测共享内存是否被其他核写入    |

 总结：硬件原子性的实现机制

| 层级     | 技术                     | 作用                   |
| -------- | ------------------------ | ---------------------- |
| 指令层   | `CMPXCHG`, `LDREX/STREX` | 提供原子读改写         |
| 微架构层 | `LOCK` 前缀 / 内存屏障   | 保证原子执行，不被打断 |
| 缓存层   | MESI 协议                | 多核环境下的缓存一致性 |
| 总线层   | 总线锁（早期）           | 粗暴保障内存独占访问权 |

# 锁实现原理总结

synchronized 通过JVM指令自动获取锁和释放锁，底层通过Monitor对象中的属性`pthread_mutex_t` 的字段`__lock`进行CAS操作实现，如果CAS失败则进入内核态阻塞，等待其他线程唤醒。

Lock 通过对AQS中的字段`state`进行CAS操作实现。

synchronized 与Lock 最本质的区别：

- synchronized 由JVM实现了MESA模型，Lock 通过Java代码实现了MESA模型
- synchronized 会调用 `syscall` 进入内核等待，Lock不会

