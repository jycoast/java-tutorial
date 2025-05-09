# **CAS&Atomic原子操作详解**

## **什么是原子操作？如何实现原子操作？**

什么是原子性？相信很多同学在工作中经常使用事务， 事务的一大特性就是原子性（事务具有 ACID 四大特性）， 一个事务包含多个操作，这些操作要么全部执行，要么全都不执行。

并发里的原子性和原子操作是一样的内涵和概念，假定有两个操作 A 和 B    都包含多个步骤，如果从执行 A 的线程来看， 当另一个线程执行 B 时， 要么将 B 全部执行完， 要么完全不执行 B ，执行 B 的线程看 A 的操作也是一样的， 那么 A 和 B 对彼此来说是原子的。

实现原子操作可以使用锁， 锁机制， 满足基本的需求是没有问题的了， 但是有的时候我们的需求并非这么简单，我们需要更有效，更加灵活的机制，

synchronized 关键字是基于阻塞的锁机制，也就是说当一个线程拥有锁的时候， 访问同一资源的其它线程需要等待，直到该线程释放锁。

这里会有些问题： 首先，如果被阻塞的线程优先级很高很重要怎么办？其次， 如果获得锁的线程一直不释放锁怎么办？ 同时，还有可能出现一些例如死锁之类的情况， 最后， 其实锁机制是一种比较粗糙， 粒度比较大的机制， 相对于像计数器这样的需求有点儿过于笨重。为了解决这个问题， Java 提供了 Atomic 系列的 原子操作类。

这些原子操作类其实是使用当前的处理器基本都支持 CAS 的指令，比如 Intel  的汇编指令 cmpxchg，每个厂家所实现的具体算法并不一样，但是原理基本一样。 每一个 CAS 操作过程都包含三个运算符： 一个内存地址 V，一个期望的值 A 和一 个新值 B，操作的时候如果这个地址上存放的值等于这个期望的值 A，则将地址 上的值赋为新值 B，否则不做任何操作。

CAS 的基本思路就是， 如果这个地址上的值和期望的值相等， 则给其赋予新 值， 否则不做任何事儿，但是要返回原值是多少。 自然 CAS 操作执行完成时， 在 业务上不一定完成了， 这个时候我们就会对 CAS 操作进行反复重试， 于是就有了 循环 CAS。很明显， 循环 CAS 就是在一个循环里不断的做 cas 操作， 直到成功为 止。 Java 中的 Atomic 系列的原子操作类的实现则是利用了循环 CAS 来实现。

<img src="https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/202501072327161.png" style="zoom:150%;" />

## **CAS** **实现原子操作的三大问题**

### **ABA** **问题**

因为 CAS 需要在操作值的时候， 检查值有没有发生变化， 如果没有发生变化则更新，但是如果一个值原来是 A，变成了 B，又变成了 A，那么使用 CAS 进行检查时会发现它的值没有发生变化，但是实际上却变化了。

ABA 问题的解决思路就是使用版本号。在变量前面追加上版本号， 每次变量更新的时候把版本号加 1，那么 A →B →A 就会变成 1A →2B →3A。举个通俗点的例子， 你倒了一杯水放桌子上， 干了点别的事， 然后同事把你水喝了又给你重新倒了一杯水， 你回来看水还在， 拿起来就喝， 如果你不管水中间被人喝过， 只关心水还在，这就是 ABA 问题。

如果你是一个讲卫生讲文明的小伙子， 不但关心水在不在， 还要在你离开的时候水被人动过没有，因为你是程序员，所以就想起了放了张纸在旁边，写上初始值 0，别人喝水前麻烦先做个累加才能喝水。

### **循环时间长开销大。**

自旋 CAS 如果长时间不成功，会给 CPU 带来非常大的执行开销。

### **只能保证一个共享变量的原子操作。**

当对一个共享变量执行操作时， 我们可以使用循环 CAS 的方式来保证原子操 作， 但是对多个共享变量操作时， 循环 CAS 就无法保证操作的原子性， 这个时候 就可以用锁。

还有一个取巧的办法， 就是把多个共享变量合并成一个共享变量来操作。比 如，有两个共享变量 i ＝2，j=a，合并一下 ij=2a，然后用 CAS 来操作 ij。从 Java 1.5 开始， JDK 提供了 AtomicReference 类来保证引用对象之间的原子性，就可以把 多个变量放在一个对象里来进行 CAS 操作。

## **Jdk** **中相关原子操作类的使用**

参见代码，包 cn.tulingxueyuan.cas 下

### **AtomicInteger**

- intaddAndGet（int delta）：以原子方式将输入的数值与实例中的值 （AtomicInteger 里的 value）相加，并返回结果。
- boolean compareAndSet（int expect ，int update）：如果输入的数值等于预期值，则以原子方式将该值设置为输入的值。
- intgetAndIncrement()：以原子方式将当前值加 1，注意，这里返回的是自增前的值。
- intgetAndSet（int newValue）：以原子方式设置为 newValue 的值， 并返回 旧值。

### **AtomicIntegerArray**

主要是提供原子的方式更新数组里的整型，其常用方法如下。

- intaddAndGet（inti，int delta）：以原子方式将输入值与数组中索引 i 的元 素相加。
- boolean compareAndSet（inti ，int expect ，int update）：如果当前值等于预期值，则以原子方式将数组位置 i 的元素设置成 update 值。

需要注意的是， 数组 value 通过构造方法传递进去， 然后 AtomicIntegerArray 会将当前数组复制一份，所以当 AtomicIntegerArray 对内部的数组元素进行修改时，不会影响传入的数组。

### **更新引用类型**

原子更新基本类型的 AtomicInteger，只能更新一个变量， 如果要原子更新多 个变量，就需要使用这个原子更新引用类型提供的类。 Atomic 包提供了以下3个类。

#### **AtomicReference**

原子更新引用类型。

#### **AtomicStampedReference**

利用版本戳的形式记录了每次改变以后的版本号， 这样的话就不会存在 ABA  问题了。这就是 AtomicStampedReference 的解决方案。AtomicMarkableReference  跟 AtomicStampedReference 差不多， AtomicStampedReference 是使用 pair 的 int  stamp 作为计数器使用，AtomicMarkableReference 的 pair 使用的是 boolean mark。 还是那个水的例子， AtomicStampedReference 可能关心的是动过几次，AtomicMarkableReference 关心的是有没有被人动过，方法都比较简单。

#### **AtomicMarkableReference**

原子更新带有标记位的引用类型。可以原子更新一个布尔类型的标记位和引用类型。构造方法是 AtomicMarkableReference（V initialRef，booleaninitialMark）。

### **原子更新字段类**

如果需原子地更新某个类里的某个字段时，就需要使用原子更新字段类， Atomic 包提供了以下 3 个类进行原子字段更新。

要想原子地更新字段类需要两步。第一步，因为原子更新字段类都是抽象类， 每次使用的时候必须使用静态方法 newUpdater()创建一个更新器， 并且需要设置 想要更新的类和属性。第二步，更新类的字段（属性）必须使用 public volatile     修饰符。

#### **AtomicIntegerFieldUpdater**

原子更新整型的字段的更新器。

#### **AtomicLongFieldUpdater**

原子更新长整型字段的更新器。

#### **AtomicReferenceFieldUpdater**

原子更新引用类型里的字段。

## **LongAdder**

JDK1.8 时，java.util.concurrent.atomic 包中提供了一个新的原子类：LongAdder。 根据 Oracle 官方文档的介绍， LongAdder 在高并发的场景下会比它的前辈---AtomicLong  具有更好的性能，代价是消耗更多的内存空间。

**AtomicLong** 是利用了底层的 CAS 操作来提供并发性的， 调用了 **Unsafe** 类的 **getAndAddLong** 方法， 该方法是个 **native** 方法， 它的逻辑是采用自旋的方式不断更新目标值，直到更新成功。

在并发量较低的环境下， 线程冲突的概率比较小， 自旋的次数不会很多。但是，高并发环境下，N 个线程同时进行自旋操作，会出现大量失败并不断自旋的情况，此时 **AtomicLong** 的自旋会成为瓶颈。

这就是 **LongAdder** 引入的初衷——解决高并发环境下 **AtomicLong** 的自旋瓶颈问题。

**AtomicLong** 中有个内部变量 **value** 保存着实际的 long 值，所有的操作都是 针对该变量进行。也就是说，高并发环境下， value 变量其实是一个热点，也就 是 N 个线程竞争一个热点。

```java
private volatile longvalue;
```

**LongAdder** 的基本思路就是*分散热点*，将 value 值分散到一个数组中，不同 线程会命中到数组的不同槽中，各个线程只对自己槽中的那个值进行 CAS 操作， 这样热点就被分散了，冲突的概率就小很多。如果要获取真正的 long 值，只要  将各个槽中的变量值累加返回。

这种做法和 ConcurrentHashMap 中的“分段锁”其实就是类似的思路。

**LongAdder** 提供的 API 和 **AtomicLong** 比较接近，两者都能以原子的方式对 long 型变量进行增减。

但是 **AtomicLong** 提供的功能其实更丰富，尤其是 **addAndGet**、 **decrementAndGet** 、**compareAndSet** 这些方法。

**addAndGet** 、**decrementAndGet** 除了单纯的做自增自减外， 还可以立即获取 增减后的值， 而 **LongAdder** 则需要做同步控制才能精确获取增减后的值。如果业 务需求需要精确的控制计数，做计数比较， **AtomicLong** 也更合适。

另外， 从空间方面考虑， **LongAdder** 其实是一种“空间换时间”的思想， 从 这一点来讲 **AtomicLong** 更适合。

总之， 低并发、一般的业务场景下 AtomicLong 是足够了。如果并发量很多， 存在大量写多读少的情况， 那 LongAdder 可能更合适。适合的才是最好的， 如果

真出现了需要考虑到底用 AtomicLong 好还是 LongAdder 的业务场景，那么这样 的讨论是没有意义的， 因为这种情况下要么进行性能测试， 以准确评估在当前业 务场景下两者的性能，要么换个思路寻求其它解决方案。

对于 **LongAdder** 来说， 内部有一个 base 变量，一个 Cell[]数组。 base 变量：非竞态条件下，直接累加到该变量上。

Cell[]数组：竞态条件下，累加个各个线程自己的槽 Cell[i]中。

​	transientvolatile cell[  ]cells;    

transient volatile long base;   

所以，最终结果的计算应该是

![image-20250107233534534](https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/202501072335555.png)

![image-20250107233551397](https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/202501072335410.png)

在实际运用的时候， 只有从未出现过并发冲突的时候， base 基数才会使用 到， 一旦出现了并发冲突，之后所有的操作都只针对 Cell[]数组中的单元 Cell。

![image-20250107233602487](https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/202501072336507.png)

而 LongAdder 最终结果的求和，并没有使用全局锁，返回值不是绝对准确的， 因为调用这个方法时还有其他线程可能正在进行计数累加， 所以只能得到某个时 刻的近似值，这也就是 **LongAdder** 并不能完全替代 **LongAtomic** 的原因之一。

而且从测试情况来看，线程数越多， 并发操作数越大， LongAdder 的优势越 大，线程数较小时，AtomicLong 的性能还超过了 LongAdder。

### **其他新增**

除了新引入 LongAdder 外，还有引入了它的三个兄弟类： **LongAccumulator**、 **DoubleAdder** 、**DoubleAccumulator**。

LongAccumulator 是 LongAdder 的增强版。LongAdder 只能针对数值的进行加减运算，而 LongAccumulator 提供了自定义的函数操作。

通过 LongBinaryOperator，可以自定义对入参的任意操作，并返回结果 （LongBinaryOperator 接收 2 个 long 作为参数，并返回 1 个 long）。

LongAccumulator 内部原理和 LongAdder 几乎完全一样。

DoubleAdder 和 DoubleAccumulator 用于操作 double 原始类型。


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