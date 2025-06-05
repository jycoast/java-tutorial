# 生产者-消费者模式


生产者-消费者模式是一个十分经典的多线程并发协作的模式，弄懂生产者-消费者问题能够让我们对并发编程的理解加深。所谓生产者-消费者问题，实际上主要是包含了两类线程，一种是生产者线程用于生产数据，另一种是消费者线程用于消费数据，为了解耦生产者和消费者的关系，通常会采用共享的数据区域，就像是一个仓库，生产者生产数据之后直接放置在共享数据区中，并不需要关心消费者的行为；而消费者只需要从共享数据区中去获取数据，就不再需要关心生产者的行为。但是，这个共享数据区域中应该具备这样的线程间并发协作的功能：

1. 如果共享数据区已满的话，阻塞生产者继续生产数据放置入内；
2. 如果共享数据区为空的话，阻塞消费者继续消费数据；


在实现生产者消费者问题时，可以如下方式：

1.使用Object的wait/notify的消息通知机制；

2.使用suspend/resume

3.使用Lock的Condition的await/signal的消息通知机制；

4.使用LockSupport

## wait/notify的消息通知机制 ##

Java 中，可以通过配合调用 Object 对象的 wait() 方法和 notify()方法或 notifyAll() 方法来实现线程间的通信。在线程中调用 wait() 方法，将阻塞当前线程，直至等到其他线程调用了调用 notify() 方法或 notifyAll() 方法进行通知之后，当前线程才能从wait()方法出返回，继续执行下面的操作。

`wait` 和 `notify` 是 Java 中用于线程间通信的重要机制，基于 `Object` 类的方法。这些方法通常与同步（`synchronized`）一起使用，用来控制多个线程的执行顺序或实现某种线程协作。它们是通过 JVM 内部的监视器（monitor）机制来实现的。

**`wait()` 的原理**

- `wait()` 方法会导致当前线程放弃锁并进入 **等待队列**，直到被其他线程唤醒。线程在调用 `wait()` 时释放当前对象的锁，然后进入该对象的等待队列。
- 调用 `wait()` 时，线程进入休眠状态，直到接收到 `notify()` 或 `notifyAll()` 的通知。此时，它需要重新竞争锁，然后才可以继续执行。

**工作原理**：

- 线程调用 `wait()` 方法时，它会释放持有的锁，并使自己进入该对象的等待队列（该对象是调用 `wait()` 的对象）。
- 该线程会在等待队列中直到被通知唤醒（通过 `notify()` 或 `notifyAll()`）为止。
- 线程被唤醒后，它并不会立刻继续执行，而是需要重新争夺锁。只有在获得锁后，才会继续执行。

**`notify()` 和 `notifyAll()` 的原理**

- `notify()` 会随机唤醒一个在等待队列中的线程。
- `notifyAll()` 会唤醒等待队列中的所有线程，允许它们重新竞争锁。
- 唤醒的线程并不会立即执行，而是会进入 **锁争夺队列**，等待重新获取锁。

**工作原理**：

- `notify()` 或 `notifyAll()` 会将等待队列中的一个或多个线程唤醒。被唤醒的线程会重新竞争锁，只有获取到锁的线程才可以继续执行。

**注意事项：**

- `wait()` 和 `notify()` 只能在 **同步方法** 或 **同步块** 中调用（即代码必须获得锁）。如果没有获得锁，调用这些方法会抛出 `IllegalMonitorStateException` 异常。
- `wait()` 是一个**阻塞**操作，线程在调用后会进入该对象的等待队列，直到被唤醒。
- `notify()` 或 `notifyAll()` 只是唤醒线程，具体哪一个线程能够继续执行取决于线程调度器的选择。唤醒后，线程还需要等待获得锁。

## 使用wait/notifyAll实现生产者-消费者 ##

利用wait/notifyAll实现生产者和消费者代码如下：


```java
public class WaitNotifyBuffer {

    private int data = 0;

    public synchronized void produce() throws InterruptedException {
        while (data > 0) {
            wait(); // 如果数据已经存在，生产者等待
        }
        data++; // 生产数据
        System.out.println("Produced: " + data);
        notify(); // 唤醒消费者
    }

    public synchronized void consume() throws InterruptedException {
        while (data == 0) {
            wait(); // 如果没有数据，消费者等待
        }
        data--; // 消费数据
        System.out.println("Consumed: " + data);
        notify(); // 唤醒生产者
    }
}
```

## 使用suspend/resume实现生产者-消费者

```java
public class SuspendResumeBuffer {
    private int data = 0;
    private volatile Thread producerThread;
    private volatile Thread consumerThread;


    public synchronized void produce() {
        producerThread = Thread.currentThread(); // 记录消费者线程
        while (data > 0) {
            producerThread.suspend(); // 暂停生产者（不安全）
        }
        data++;
        System.out.println("Produced: " + data);
        if (consumerThread != null) {
            consumerThread.resume(); // 恢复消费者（不安全）
        }
    }

    public synchronized void consume() {
        consumerThread = Thread.currentThread(); // 记录消费者线程
        while (data == 0) {
            consumerThread.suspend(); // 暂停消费者（不安全）
        }
        data--;
        System.out.println("Consumed: " + data);
        if (producerThread != null) {
            producerThread.resume(); // 恢复生产者（不安全）
        }
    }
}
```

## 使用Lock中Condition的await/signalAll实现生产者-消费者 ##

[详解Condition的await和signal等待/通知机制](https://juejin.im/post/5aeea5e951882506a36c67f0)

如果采用lock中Conditon的消息通知原理来实现生产者-消费者问题，原理同使用wait/notifyAll一样。

```java
public class LockConditionBuffer {

    private int data = 0;
    private final ReentrantLock lock = new ReentrantLock();

    // 用于将不满足条件的线程挂起在指定的条件变量上，而当条件满足的时候，再唤醒对应的线程让其执行。
    private final Condition notFull = lock.newCondition(); // 对应生产者等待条件
    private final Condition notEmpty = lock.newCondition(); // 对应消费者等待条件

    public void produce() throws InterruptedException {
        lock.lock(); // 获取锁
        try {
            while (data > 0) {
                notFull.await(); // 如果数据已存在，生产者等待
            }
            data++; // 生产数据
            System.out.println("Produced: " + data);
            notEmpty.signal(); // 唤醒消费者
        } finally {
            lock.unlock(); // 释放锁
        }
    }

    public void consume() throws InterruptedException {
        lock.lock(); // 获取锁
        try {
            while (data == 0) {
                notEmpty.await(); // 如果没有数据，消费者等待
            }
            data--; // 消费数据
            System.out.println("Consumed: " + data);
            notFull.signal(); // 唤醒生产者
        } finally {
            lock.unlock(); // 释放锁
        }
    }
}
```

## 使用LockSupport实现生产者-消费者

```java
public class ParkUnParkBuffer {

    private int data = 0;
    private volatile Thread producerThread = null;
    private volatile Thread consumerThread = null;

    public void produce() {
        Thread currentThread = Thread.currentThread();
        producerThread = currentThread; // 记录生产者线程

        while (true) {
            synchronized (this) { // 确保data的读写线程安全
                if (data == 0) { // 可以生产
                    data++;
                    System.out.println("Produced: " + data);
                    if (consumerThread != null) {
                        LockSupport.unpark(consumerThread); // 唤醒消费者
                    }
                    return; // 生产完成，退出
                }
            }
            LockSupport.park(); // 数据已存在，阻塞生产者
        }

    }

    public void consume() {
        Thread currentThread = Thread.currentThread();
        consumerThread = currentThread; // 记录消费者线程

        while (true) {
            synchronized (this) { // 确保data的读写线程安全
                if (data > 0) { // 可以消费
                    data--;
                    System.out.println("Consumed: " + data);
                    if (producerThread != null) {
                        LockSupport.unpark(producerThread); // 唤醒生产者
                    }
                    return; // 消费完成，退出
                }
            }
            LockSupport.park(); // 没有数据，阻塞消费者
        }
    }
}
```

# wait/notify的实现原理

## LockSupport中的park/unpark方法

Unsafe类中函数基本都是Native属性, 在虚拟机源代码/hotspot/src/share/vm/prims/unsafe.cpp(L1561)中, 定义了Unsafe类Native与c++语言函数之间对应关系, 如下所示:

```cpp
 // These are the methods for 1.8.0
static JNINativeMethod methods_18[] = {
    {CC"getObject",        CC"("OBJ"J)"OBJ"",   FN_PTR(Unsafe_GetObject)},
    {CC"putObject",        CC"("OBJ"J"OBJ")V",  FN_PTR(Unsafe_SetObject)},
    {CC"getObjectVolatile",CC"("OBJ"J)"OBJ"",   FN_PTR(Unsafe_GetObjectVolatile)},
    {CC"putObjectVolatile",CC"("OBJ"J"OBJ")V",  FN_PTR(Unsafe_SetObjectVolatile)},
    {CC"getAddress",         CC"("ADR")"ADR,             FN_PTR(Unsafe_GetNativeAddress)},
    {CC"putAddress",         CC"("ADR""ADR")V",          FN_PTR(Unsafe_SetNativeAddress)},
    {CC"allocateMemory",     CC"(J)"ADR,                 FN_PTR(Unsafe_AllocateMemory)},
    {CC"reallocateMemory",   CC"("ADR"J)"ADR,            FN_PTR(Unsafe_ReallocateMemory)},
    {CC"freeMemory",         CC"("ADR")V",               FN_PTR(Unsafe_FreeMemory)},
    {CC"objectFieldOffset",  CC"("FLD")J",               FN_PTR(Unsafe_ObjectFieldOffset)},
    {CC"staticFieldOffset",  CC"("FLD")J",               FN_PTR(Unsafe_StaticFieldOffset)},
    {CC"staticFieldBase",    CC"("FLD")"OBJ,             FN_PTR(Unsafe_StaticFieldBaseFromField)},
    {CC"ensureClassInitialized",CC"("CLS")V",            FN_PTR(Unsafe_EnsureClassInitialized)},
    {CC"arrayBaseOffset",    CC"("CLS")I",               FN_PTR(Unsafe_ArrayBaseOffset)},
    {CC"arrayIndexScale",    CC"("CLS")I",               FN_PTR(Unsafe_ArrayIndexScale)},
    {CC"addressSize",        CC"()I",                    FN_PTR(Unsafe_AddressSize)},
    {CC"pageSize",           CC"()I",                    FN_PTR(Unsafe_PageSize)},
    {CC"defineClass",        CC"("DC_Args")"CLS,         FN_PTR(Unsafe_DefineClass)},
    {CC"allocateInstance",   CC"("CLS")"OBJ,             FN_PTR(Unsafe_AllocateInstance)},
    {CC"monitorEnter",       CC"("OBJ")V",               FN_PTR(Unsafe_MonitorEnter)},
    {CC"monitorExit",        CC"("OBJ")V",               FN_PTR(Unsafe_MonitorExit)},
    {CC"tryMonitorEnter",    CC"("OBJ")Z",               FN_PTR(Unsafe_TryMonitorEnter)},
    {CC"throwException",     CC"("THR")V",               FN_PTR(Unsafe_ThrowException)},
    {CC"compareAndSwapObject", CC"("OBJ"J"OBJ""OBJ")Z",  FN_PTR(Unsafe_CompareAndSwapObject)},
    {CC"compareAndSwapInt",  CC"("OBJ"J""I""I"")Z",      FN_PTR(Unsafe_CompareAndSwapInt)},
    {CC"compareAndSwapLong", CC"("OBJ"J""J""J"")Z",      FN_PTR(Unsafe_CompareAndSwapLong)},
    {CC"putOrderedObject",   CC"("OBJ"J"OBJ")V",         FN_PTR(Unsafe_SetOrderedObject)},
    {CC"putOrderedInt",      CC"("OBJ"JI)V",             FN_PTR(Unsafe_SetOrderedInt)},
    {CC"putOrderedLong",     CC"("OBJ"JJ)V",             FN_PTR(Unsafe_SetOrderedLong)},
    {CC"park",               CC"(ZJ)V",                  FN_PTR(Unsafe_Park)},
    {CC"unpark",             CC"("OBJ")V",               FN_PTR(Unsafe_Unpark)}
};
```

可以看出, 我们关注的park和unpark分别对应了Unsafe_Park与Unsafe_Unpark。 下面展示了Unsafe_Park的实现方式:

```cpp
UNSAFE_ENTRY(void, Unsafe_Park(JNIEnv *env, jobject unsafe, jboolean isAbsolute, jlong time))
  UnsafeWrapper("Unsafe_Park");
  EventThreadPark event;
#ifndef USDT2
  HS_DTRACE_PROBE3(hotspot, thread__park__begin, thread->parker(), (int) isAbsolute, time);
#else /* USDT2 */
   HOTSPOT_THREAD_PARK_BEGIN(
                             (uintptr_t) thread->parker(), (int) isAbsolute, time);
#endif /* USDT2 */
  JavaThreadParkedState jtps(thread, time != 0);
  thread->parker()->park(isAbsolute != 0, time);   //进的是这个函数
#ifndef USDT2
  HS_DTRACE_PROBE1(hotspot, thread__park__end, thread->parker());
#else /* USDT2 */
  HOTSPOT_THREAD_PARK_END(
                          (uintptr_t) thread->parker());
#endif /* USDT2 */
  if (event.should_commit()) {
    oop obj = thread->current_park_blocker();
    event.set_klass((obj != NULL) ? obj->klass() : NULL);
    event.set_timeout(time);
    event.set_address((obj != NULL) ? (TYPE_ADDRESS) cast_from_oop<uintptr_t>(obj) : 0);
    event.commit();
  }
UNSAFE_END
```

我们可以清晰得看到, 真正调用的是thread->parker()->park(isAbsolute != 0, time)方法。

### Parker.park()

我们需要了解下vm中thread是如何组成的, JavaThread定义在/hotspot/src/share/vm/prims/runtime/thread.hpp(L1740), 关于Parker成员变量声明如下:

```cpp
private:
  Parker*    _parker;
public:
  Parker*     parker() { return _parker; }

```

可以看出, 每个thread类中都包含一个Parker。
Parker定义在/hotspot/src/share/vm/runtime/park.hpp(L56), 定义如下:

```cpp
class Parker : public os::PlatformParker {
private:
  //当_counter只能在0和1之间取值, 当为1时, 代表该类被unpark调用过, 更多的调用, 也不会增加_counter的值, 当该线程调用park()时, 不会阻塞, 同时_counter立刻清零。当为0时, 调用park()会被阻塞。使用volatile来修饰
  volatile int _counter ;
  Parker * FreeNext ;
  JavaThread * AssociatedWith ; // Current association
public:
  Parker() : PlatformParker() {
    _counter       = 0 ;
    FreeNext       = NULL ;
    AssociatedWith = NULL ;
  }
```

PlatformParker继承自Parker, 定义在/hotspot/src/os/linux/vm/os_linux.cpp(L234)：

```cpp
class PlatformParker : public CHeapObj<mtInternal> {
  protected:
    enum {
        REL_INDEX = 0,
        ABS_INDEX = 1
    };
    int _cur_index;  // which cond is in use: -1, 0, 1
    pthread_mutex_t _mutex [1] ;
    pthread_cond_t  _cond  [2] ; // one for relative times and one for abs.

  public:       // TODO-FIXME: make dtor private
    ~PlatformParker() { guarantee (0, "invariant") ; }

  public:
    PlatformParker() {
      int status;
      status = pthread_cond_init (&_cond[REL_INDEX], os::Linux::condAttr());
      assert_status(status == 0, status, "cond_init rel");
      status = pthread_cond_init (&_cond[ABS_INDEX], NULL);
      assert_status(status == 0, status, "cond_init abs");
      status = pthread_mutex_init (_mutex, NULL);
      assert_status(status == 0, status, "mutex_init");
      _cur_index = -1; // mark as unused
    }
```

pthread_mutex_t 和 pthread_cond_t 都是为了配合完成c++层面线程的阻塞与互斥等操作。

```cpp
void Parker::park(bool isAbsolute, jlong time) {
  // Ideally we'd do something useful while spinning, such
  // as calling unpackTime().
  // Optional fast-path check:
  // Return immediately if a permit is available.
  // We depend on Atomic::xchg() having full barrier semantics
  // since we are doing a lock-free update to _counter.
   //这里通过原子操作来完成_counter清零操作。 若_counter之前>0, 那么说明之前该线程被unpark()过, 就可以直接返回而不被阻塞。
  if (Atomic::xchg(0, &_counter) > 0) return;
  Thread* thread = Thread::current();
  assert(thread->is_Java_thread(), "Must be JavaThread");  //判断一定的是java线程
  JavaThread *jt = (JavaThread *)thread; //类强制转化
  // Optional optimization -- avoid state transitions if there's an interrupt pending.
  // Check interrupt before trying to wait
  //进入睡眠等待前先检查是否有中断信号, 若有中断信号也直接返回。
  if (Thread::is_interrupted(thread, false)) {
    return;
  }
  // Next, demultiplex/decode time arguments
  timespec absTime;
  //如果是按参数小于0，或者绝对时间，那么可以直接返回
  if (time < 0 || (isAbsolute && time == 0) ) { // don't wait at all
    return;
  }
   //如果时间大于0，判断阻塞超时时间或阻塞截止日期，同时将时间赋值给absTime
  if (time > 0) {
    unpackTime(&absTime, isAbsolute, time);
  }
  // Enter safepoint region
  // Beware of deadlocks such as 6317397.
  // The per-thread Parker:: mutex is a classic leaf-lock.
  // In particular a thread must never block on the Threads_lock while
  // holding the Parker:: mutex.  If safepoints are pending both the
  // the ThreadBlockInVM() CTOR and DTOR may grab Threads_lock.
  ThreadBlockInVM tbivm(jt);
  // Don't wait if cannot get lock since interference arises from
  // unblocking.  Also. check interrupt before trying wait
  //再次检查, 如果有中断信号。直接返回; 或者申请互斥锁失败，则直接返回pthread_mutex_trylock返回0。任何其他返回值都表示错误。
  //函数pthread_mutex_trylock是POSIX 线程pthread_mutex_lock的非阻塞版本。
  if (Thread::is_interrupted(thread, false) || pthread_mutex_trylock(_mutex) != 0) {
    return;
  }
  //此时已经通过_mutex将该代码进行了互斥操作, 那么直接对_counter都是安全的
  int status ;
  如果count>0, 说明之前原子操作赋值为0没有成功。 而_counter> 0, 线程可以直接不阻塞而返回
  if (_counter > 0)  { // no wait needed
     //将_counter直接清零
    _counter = 0;
    //释放锁并返回， 返回0代表释放锁成功
    status = pthread_mutex_unlock(_mutex);
    assert (status == 0, "invariant") ; //这里会去检查一下是否成功了
    // Paranoia to ensure our locked and lock-free paths interact
    // correctly with each other and Java-level accesses.
    OrderAccess::fence(); //这个函数是HotSpot VM对JMM的内存屏障一个具体的实现函数;
    return;
  }
#ifdef ASSERT
  // Don't catch signals while blocked; let the running threads have the signals.
  // (This allows a debugger to break into the running thread.)
  sigset_t oldsigs;
  sigset_t* allowdebug_blocked = os::Linux::allowdebug_blocked_signals();
  pthread_sigmask(SIG_BLOCK, allowdebug_blocked, &oldsigs);
#endif
  OSThreadWaitState osts(thread->osthread(), false /* not Object.wait() */);
  jt->set_suspend_equivalent();
  // cleared by handle_special_suspend_equivalent_condition() or java_suspend_self()

  assert(_cur_index == -1, "invariant");
     //若没有超时时间，那么本线程将进入睡眠状态并释放cpu、释放对_mutex的锁定，等待其他线程调用pthread_cond_signal唤醒该线程；唤醒后会获取对_mutex的锁定的锁定
  if (time == 0) {
    _cur_index = REL_INDEX; // arbitrary choice when not timed
    status = pthread_cond_wait (&_cond[_cur_index], _mutex) ;
  } else {
    _cur_index = isAbsolute ? ABS_INDEX : REL_INDEX;
     //开始真正的阻塞，超时等待，或者其他线程pthread_cond_signal唤醒该线程
    status = os::Linux::safe_cond_timedwait (&_cond[_cur_index], _mutex, &absTime) ;
    if (status != 0 && WorkAroundNPTLTimedWaitHang) {
      pthread_cond_destroy (&_cond[_cur_index]) ;
      pthread_cond_init    (&_cond[_cur_index], isAbsolute ? NULL : os::Linux::condAttr());
    }
  }
  _cur_index = -1;
  assert_status(status == 0 || status == EINTR ||
                status == ETIME || status == ETIMEDOUT,
                status, "cond_timedwait");

#ifdef ASSERT
  pthread_sigmask(SIG_SETMASK, &oldsigs, NULL);
#endif
    //该线程被唤醒了, 同时也对_mutex加锁了, 置位_counter是线程安全的
  _counter = 0 ;
  //解锁_mutex
  status = pthread_mutex_unlock(_mutex) ;
  assert_status(status == 0, status, "invariant") ;
  // Paranoia to ensure our locked and lock-free paths interact
  // correctly with each other and Java-level accesses.
  OrderAccess::fence(); //内存屏障
  // If externally suspended while waiting, re-suspend
  if (jt->handle_special_suspend_equivalent_condition()) {
    jt->java_suspend_self();
  }
}
```

Parker::park主要做了如下事情:

- 检查_counter>0(别的线程调用过unpark), 则原子操作清零。线程不用睡眠并返回。
- 检查该线程是否有中断信号, 有的话,清掉并返回。
- 尝试通过pthread_mutex_trylock对_mutex加锁来达到线程互斥。
- 检查_counter是否>0, 若成立,说明第一步原子清零操作失败。检查park是否设置超时时间, 若设置了通过safe_cond_timedwait进行超时等待; 若没有设置,调用pthread_cond_wait进行阻塞等待。 这两个函数都在阻塞等待时都会放弃cpu的使用。 直到别的线程调用pthread_cond_signal唤醒
- 直接_counter=0清零。
- 通过pthread_mutex_unlock释放mutex的加锁。
  需要了解下: safe_cond_timedwait/pthread_cond_wait在执行之前肯定已经获取了锁_mutex, 在睡眠前释放了锁, 在被唤醒之前, 首先再取唤醒锁。

### Parker.unpark()

唤醒操作相对简单:

```cpp
void Parker::unpark() {
  int s, status ;
  //首先是互斥获取锁
  status = pthread_mutex_lock(_mutex);
  assert (status == 0, "invariant") ;
  s = _counter;
  //只要把这个状态置为1就行了，就是说多次调用unpack()没啥意义
  _counter = 1;
   //s只能为0，说明没有人调用unpark
  if (s < 1) {
    // thread might be parked
    if (_cur_index != -1) {
      // thread is definitely parked
      //线程已经处于parker状态了
      if (WorkAroundNPTLTimedWaitHang) {
       //pthread_cond_signal可以唤醒pthread_cond_wait()被&_cond[_cur_index]阻塞的线程
        status = pthread_cond_signal (&_cond[_cur_index]);
        assert (status == 0, "invariant");
        //解锁
        status = pthread_mutex_unlock(_mutex);
        assert (status == 0, "invariant");
      } else {
        status = pthread_mutex_unlock(_mutex);
        assert (status == 0, "invariant");
        status = pthread_cond_signal (&_cond[_cur_index]);
        assert (status == 0, "invariant");
      }
    } else {
    //仅仅解锁
      pthread_mutex_unlock(_mutex);
      assert (status == 0, "invariant") ;
    }
  } else {
    pthread_mutex_unlock(_mutex);
    assert (status == 0, "invariant") ;
  }
}
```

unpark()主要做了如下事情:

- 首先获取锁_mutex。
- 对_counter置为1, 而不管之前什么值, 这里说明无论多少函数调用unpark(), 都是无效的, 只会记录一次。
- 检查线程是否已经被阻塞了, 若已经阻塞了,调用pthread_cond_signal唤醒唤醒。
- 释放对_mutex的锁定。

## wait/notify的源码解析

当线程调用 `wait()` 方法时，HotSpot JVM 会执行以下操作：

1. **释放锁：** 当前线程释放持有的对象锁，使其他线程能够进入同步代码块。
2. **进入等待队列：** 线程被加入到与对象关联的等待队列中，进入挂起状态。
3. **挂起线程：** 线程被挂起，等待其他线程的通知。

- **代码实现：**
  - `ObjectMonitor::wait()`

ObjectMonitor中wait 方法的实现：

```cpp
void ObjectMonitor::wait(jlong millis, bool interruptible, TRAPS) {
    // 参数说明：
    // - millis: 等待超时时间（毫秒），0 表示无限期等待
    // - interruptible: 是否允许线程被中断（true 表示可中断）
    // - TRAPS: 宏，传递当前线程指针（Thread*），支持异常处理

    // 获取当前线程并验证其为 Java 线程
    Thread * const Self = THREAD;
    assert(Self->is_Java_thread(), "Must be Java thread!");
    JavaThread *jt = (JavaThread *)THREAD;

    // 执行延迟初始化（若需要）
    // DeferredInitialize 初始化 ObjectMonitor 的内部状态（如 ParkEvent）
    DeferredInitialize();

    // 检查当前线程是否持有锁
    // CHECK_OWNER() 验证 _owner 是否为当前线程
    // 如果当前线程不是锁的拥有者，抛出 IllegalMonitorStateException
    CHECK_OWNER();

    // 创建 JVMTI 事件对象，用于记录 monitor wait 事件
    EventJavaMonitorWait event;

    // 检查是否有待处理的中断
    // 如果 interruptible 为 true 且线程已被中断（且无其他异常），处理中断
    if (interruptible && Thread::is_interrupted(Self, true) && !HAS_PENDING_EXCEPTION) {
        // 发布 JVMTI 事件，表示等待已结束（过去时）
        if (JvmtiExport::should_post_monitor_waited()) {
            // 参数 false 表示非超时导致的等待结束
            JvmtiExport::post_monitor_waited(jt, this, false);
        }
        // 记录 monitor wait 事件（包括时间戳等信息）
        if (event.should_commit()) {
            post_monitor_wait_event(&event, 0, millis, false);
        }
        // 记录调试事件（TEVENT 用于内部跟踪）
        TEVENT(Wait - Throw IEX);
        // 抛出 InterruptedException 并返回
        THROW(vmSymbols::java_lang_InterruptedException());
        return;
    }

    // 记录调试事件，表示开始等待
    TEVENT(Wait);

    // 确保线程未被标记为 stalled（用于调试）
    assert(Self->_Stalled == 0, "invariant");
    Self->_Stalled = intptr_t(this); // 标记线程正在此 monitor 上等待
    jt->set_current_waiting_monitor(this); // 设置当前等待的 monitor

    // 创建等待节点（ObjectWaiter），用于加入 _WaitSet
    ObjectWaiter node(Self);
    node.TState = ObjectWaiter::TS_WAIT; // 设置节点状态为等待
    Self->_ParkEvent->reset(); // 重置 ParkEvent，清除之前的信号
    OrderAccess::fence(); // 内存屏障，确保 ParkEvent 重置和后续中断检查的顺序

    // 将节点加入等待集 (_WaitSet)
    // _WaitSet 是一个双向循环链表，受 _WaitSetLock 保护
    Thread::SpinAcquire(&_WaitSetLock, "WaitSet - add");
    AddWaiter(&node); // 将节点插入 _WaitSet
    Thread::SpinRelease(&_WaitSetLock);

    // 清除 _Responsible 字段（用于锁竞争优化，非关键）
    if ((SyncFlags & 4) == 0) {
        _Responsible = NULL;
    }

    // 保存锁的重入计数并清零
    intptr_t save = _recursions;
    _waiters++; // 增加等待线程计数
    _recursions = 0; // 清零重入计数，准备释放锁

    // 释放监视器锁
    // exit(true, Self) 释放锁，true 表示允许线程挂起
    exit(true, Self);
    guarantee(_owner != Self, "invariant"); // 确保锁已释放

    // 处理通知竞争问题
    // 如果其他线程在 exit() 后调用 notify() 并选择当前线程为后继，
    // 可能导致 unpark() 被 MONITOR_CONTENDED_EXIT 事件消耗
    // 这里重新 unpark() 确保线程被唤醒
    if (node._notified != 0 && _succ == Self) {
        node._event->unpark();
    }

    // 挂起线程，进入等待状态
    int ret = OS_OK; // 记录 park() 返回值
    int WasNotified = 0; // 标记是否被通知
    {
        // OSThreadWaitState 和 ThreadBlockInVM 管理线程状态
        OSThread* osthread = Self->osthread();
        OSThreadWaitState osts(osthread, true);
        {
            ThreadBlockInVM tbivm(jt);
            jt->set_suspend_equivalent(); // 标记线程为挂起等效状态

            // 检查中断或异常
            if (interruptible && (Thread::is_interrupted(THREAD, false) || HAS_PENDING_EXCEPTION)) {
                // 如果已中断或有异常，跳过 park
            }
            else if (node._notified == 0) {
                // 如果未被通知，执行 park
                if (millis <= 0) {
                    Self->_ParkEvent->park(); // 无限期等待
                } else {
                    ret = Self->_ParkEvent->park(millis); // 带超时等待
                }
            }

            // 检查是否因外部挂起（如调试器）而唤醒
            if (ExitSuspendEquivalent(jt)) {
                jt->java_suspend_self(); // 自我挂起
            }
        } // 退出 safepoint，恢复 _thread_in_vm 状态
    }

    // 从 _WaitSet 移除节点
    // 使用双检锁避免不必要的锁获取
    if (node.TState == ObjectWaiter::TS_WAIT) {
        Thread::SpinAcquire(&_WaitSetLock, "WaitSet - unlink");
        if (node.TState == ObjectWaiter::TS_WAIT) {
            DequeueSpecificWaiter(&node); // 从 _WaitSet 移除
            assert(node._notified == 0, "invariant");
            node.TState = ObjectWaiter::TS_RUN; // 设置为运行状态
        }
        Thread::SpinRelease(&_WaitSetLock);
    }

    // 确保节点不再 _WaitSet
    guarantee(node.TState != ObjectWaiter::TS_WAIT, "invariant");
    OrderAccess::loadload(); // 内存屏障
    if (_succ == Self) _succ = NULL; // 清除后继
    WasNotified = node._notified; // 记录是否被通知

    // 发布 JVMTI 事件，表示等待结束
    if (JvmtiExport::should_post_monitor_waited()) {
        JvmtiExport::post_monitor_waited(jt, this, ret == OS_TIMEOUT);
    }
    if (event.should_commit()) {
        post_monitor_wait_event(&event, node._notifier_tid, millis, ret == OS_TIMEOUT);
    }

    OrderAccess::fence(); // 内存屏障

    // 清除 stalled 标记
    assert(Self->_Stalled != 0, "invariant");
    Self->_Stalled = 0;

    // 重新获取锁
    assert(_owner != Self, "invariant");
    ObjectWaiter::TStates v = node.TState;
    if (v == ObjectWaiter::TS_RUN) {
        enter(Self); // 直接尝试获取锁
    } else {
        guarantee(v == ObjectWaiter::TS_ENTER || v == ObjectWaiter::TS_CXQ, "invariant");
        ReenterI(Self, &node); // 通过入口集或 cxq 竞争锁
        node.wait_reenter_end(this);
    }

    // 确保锁已重新获取
    guarantee(node.TState == ObjectWaiter::TS_RUN, "invariant");
    assert(_owner == Self, "invariant");
    assert(_succ != Self, "invariant");

    // 清理线程状态
    jt->set_current_waiting_monitor(NULL);

    // 恢复重入计数并减少等待计数
    guarantee(_recursions == 0, "invariant");
    _recursions = save;
    _waiters--;

    // 验证后置条件
    assert(_owner == Self, "invariant");
    assert(_succ != Self, "invariant");
    assert(((oop)(object()))->mark() == markOopDesc::encode(this), "invariant");

    // 应用 SyncFlags 的内存屏障（若启用）
    if (SyncFlags & 32) {
        OrderAccess::fence();
    }

    // 检查通知状态
    // 如果未被通知，可能是超时或中断
    if (!WasNotified) {
        if (interruptible && Thread::is_interrupted(Self, true) && !HAS_PENDING_EXCEPTION) {
            TEVENT(Wait - throw IEX from epilog);
            THROW(vmSymbols::java_lang_InterruptedException());
        }
    }
}
```

# 参考链接

objectMonitor :https://hg.openjdk.org/jdk8/jdk8/hotspot/file/87ee5ee27509/src/share/vm/runtime/objectMonitor.cpp

park源码：https://hg.openjdk.org/jdk8/jdk8/hotspot/file/87ee5ee27509/src/share/vm/runtime/park.cpp

unsafe类：https://hg.openjdk.org/jdk8/jdk8/hotspot/file/87ee5ee27509/src/share/vm/prims/unsafe.cpp

# 思考题

 1.suspend和resume方法有什么问题，为什么会被抛弃?

2.为什么park方法会使用内存屏障？

3.怎么保证线程的可见性？

```java
public class VisibilityTest {

    private boolean flag = true;

    private int count = 0;

    public void refresh() {
        flag = false;
        System.out.println(Thread.currentThread().getName() + "修改flag为false");
    }

    public void load() {
        System.out.println(Thread.currentThread().getName() + "开始执行....");
        while (flag) {
            count++;
        }
        System.out.println(Thread.currentThread().getName() + "跳出循环：count=" + count);
    }

    public static void main(String[] args) throws InterruptedException {
        VisibilityTest test = new VisibilityTest();

        Thread threadA = new Thread(() -> test.load(), "threadA");
        threadA.start();

        Thread.sleep(1000);

        Thread threadB = new Thread(() -> test.refresh(), "threadB");
        threadB.start();
    }
}
```