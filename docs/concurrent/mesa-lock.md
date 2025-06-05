# Lock的由来

前面我们提到过在并发编程领域，有两大核心问题：一个是**互斥**，即同一时刻只允许一个线程访问共享资源；另一个是**同步**，即线程之间如何通信、协作。这两大问题，管程都是能够解决的。**Java SDK 并发包通过 Lock 和 Condition 两个接口来实现管程，其中 Lock 用于解决互斥问题，Condition 用于解决同步问题**。

Java 语言本身提供的 synchronized 也是管程的一种实现，既然 Java 从语言层面已经实现了管程了，那为什么还要在 SDK 里提供另外一种实现呢？

## 再造管程的理由

对于死锁问题，可以采用**破坏不可抢占条件**方案，即占用部分资源的线程进一步申请其他资源时，如果申请不到，可以主动释放它占有的资源。

但synchronized 没有办法解决。原因是 synchronized 申请资源的时候，如果申请不到，线程直接进入阻塞状态了，而线程进入阻塞状态，啥都干不了，也释放不了线程已经占有的资源。

如果我们重新设计一把互斥锁去解决这个问题，那该怎么设计呢？

**能够响应中断**。synchronized 的问题是，持有锁 A 后，如果尝试获取锁 B 失败，那么线程就进入阻塞状态，一旦发生死锁，就没有任何机会来唤醒阻塞的线程。但如果阻塞状态的线程能够响应中断信号，也就是说当我们给阻塞的线程发送中断信号的时候，能够唤醒它，那它就有机会释放曾经持有的锁 A。这样就破坏了不可抢占条件了。

**支持超时**。如果线程在一段时间之内没有获取到锁，不是进入阻塞状态，而是返回一个错误，那这个线程也有机会释放曾经持有的锁。这样也能破坏不可抢占条件。

**非阻塞地获取锁**。如果尝试获取锁失败，并不进入阻塞状态，而是直接返回，那这个线程也有机会释放曾经持有的锁。这样也能破坏不可抢占条件。

这三种方案可以全面弥补 synchronized 的问题。

```java
// 支持中断的API
void lockInterruptibly() throws InterruptedException;

// 支持超时的API
boolean tryLock(long time, TimeUnit unit) throws InterruptedException;

// 支持非阻塞获取锁的API
boolean tryLock();
```

# MESA 与 Java中的锁机制

## MESA 与 synchronized

![image-20250427210623235](https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/image-20250427210623235.png)

## MESA 与 Lock

![image-20250428171338046](https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/image-20250428171338046.png)

# AQS 源码探究

## CLH队列

![image.png](https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/171d2d42c77b2765~tplv-t2oaga2asx-image.image)

## AQS的结构

```java
public class AbstractQueuedSynchronizer {
    // 头结点，你直接把它当做 当前持有锁的线程 可能是最好理解的
	private transient volatile Node head;

    // 阻塞的尾节点，每个新的节点进来，都插入到最后，也就形成了一个链表
    private transient volatile Node tail;

    // 这个是最重要的，代表当前锁的状态，0代表没有被占用，大于 0 代表有线程持有当前锁
    // 这个值可以大于 1，是因为锁可以重入，每次重入都加上 1
    private volatile int state;

    // 代表当前持有独占锁的线程，举个最重要的使用例子，因为锁可以重入
    // ReentrantLock#lock()可以嵌套调用多次，所以每次用这个来判断当前线程是否已经拥有了锁
    // if (currentThread == getExclusiveOwnerThread()) {state++}
    private transient Thread exclusiveOwnerThread; //继承自AbstractOwnableSynchronizer
    
    // 获取锁
    public final void acquire(int arg);
    
    // 把线程包装成node，同时进入到队列中
    private Node addWaiter(Node mode);
    
    // 队列中是否有其他的线程在等待锁
    // 方法返回值的含义：true：如果当前线程之前有一个排队线程，false：如果当前线程是头结点是当前线程或者队列为空
    public final boolean hasQueuedPredecessors();
    
    // 负责处理这个节点在队列中的逻辑，决定线程是继续等待还是尝试获取锁。
    // 如果线程无法立即获取锁，acquireQueued会通过LockSupport.park挂起线程，减少CPU资源浪费。
    // 当锁被释放或其他条件满足时，前驱节点会通过LockSupport.unpark唤醒后续节点的线程，线程继续尝试获取锁。
    // 会检测线程是否被中断。如果线程在等待过程中被中断，它会记录中断状态并根据调用上下文决定是否抛出InterruptedException。
   	final boolean acquireQueued(final Node node, int arg);
}
```

AbstractQueuedSynchronizer 的等待队列示意如下所示，注意了，之后分析过程中所说的 queue，也就是阻塞队列**不包含 head**。

![aqs-0](https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/aqs-0.png)

等待队列中每个线程被包装成一个 Node 实例，数据结构是链表：

```java
static final class Node {
    // 标识节点当前在共享模式下
    static final Node SHARED = new Node();
    
    // 标识节点当前在独占模式下
    static final Node EXCLUSIVE = null;
  
    // ======== 下面的几个int常量是给waitStatus用的 ===========
    
    // 表示此线程取消了争抢这个锁
    static final int CANCELLED =  1;
  
    // 表示当前node的后继节点对应的线程需要被唤醒
    static final int SIGNAL = -1;
    
    // 表示阻塞在条件等待队列上
    static final int CONDITION = -2;
    
    // 表示应将releaseShared传播到其他节点。这是在doReleaseShared中设置的（仅适用于头部节点），以确保传播继续，即使此后有其他操作介入。
    static final int PROPAGATE = -3;
  
    // 取值为上面的1、-1、-2、-3，或者0(以后会讲到)
    // 这么理解，暂时只需要知道如果这个值 大于0 代表此线程取消了等待
    volatile int waitStatus;
    
    // 前驱节点的引用
    volatile Node prev;
    
    // 后继节点的引用
    volatile Node next;
    
   // 在同步队列里用来标识节点是独占锁节点还是共享锁节点，在条件队列里代表条件条件队列的下一个节点
   Node nextWaiter;
        
    // 当前线程
    volatile Thread thread;
}
```

## 等待队列

<img src="https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/image-20250428163253908.png" alt="image-20250428163253908" style="zoom:67%;" />

![image-20250428163312189](https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/image-20250428163312189.png)

## Conditon中的结构

```java
public class ConditionObject {
    // 将当前线程封装为 Node（状态为 Node.CONDITION）并加入条件队列
	// 清理已取消的节点（CANCELLED状态）
    addConditionWaiter();
    
    // 完全释放当前线程持有的锁（包括重入锁的多次计数）
    // 返回释放前的锁状态（用于后续恢复）
    fullyRelease(Node node);
    
    // 检查节点是否在 AQS 的同步队列中（用于判断线程是否已被唤醒）
    isOnSyncQueue(Node node);
    
    // 将条件队列中的节点转移到同步队列，并唤醒对应线程
    transferForSignal(Node node);
    
    // 清理条件队列中已取消的节点（例如被中断或超时的线程）
    unlinkCancelledWaiters();
    
    // 检查线程在等待过程中是否被中断，返回中断处理模式
    checkInterruptWhileWaiting(Node node);
    
    // 根据中断模式处理中断（抛出异常或重新设置中断状态）
    reportInterruptAfterWait(int interruptMode);
}
```

## 加锁过程

如果同时有**三个线程**并发抢占锁，此时**线程一**抢占锁成功，**线程二**和**线程三**抢占锁失败，具体执行流程如下：

![image.png](https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/171d2d42c5d2eb2c~tplv-t2oaga2asx-image.image)

那么此时AQS内部的数据是：

![image.png](https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/171d2d42c8e5e268~tplv-t2oaga2asx-image.image)

加锁的源码解析：

```java
static final class FairSync extends Sync {
      
    // 争锁
    final void lock() {
       acquire(1);
    }
   
    // 我们看到，这个方法，如果tryAcquire(arg) 返回true, 也就结束了。
    // 否则，acquireQueued方法会将线程压到队列中
    public final void acquire(int arg) { // 此时 arg == 1
        // 首先调用tryAcquire(1)一下，尝试获取锁，如果获取到锁，就不需要进阻塞队列
        // 公平锁的语义：线程按请求锁的先后顺序排队，先请求的线程先获得锁
        // 非公平锁的语义：线程可以直接尝试获取锁
        if (!tryAcquire(arg) &&
            // tryAcquire(arg) 没有成功，这个时候需要把当前线程挂起，放到阻塞队列中。
            acquireQueued(addWaiter(Node.EXCLUSIVE), arg)) {
            selfInterrupt();
        }
    }

    // 尝试直接获取锁，返回值是boolean，代表是否获取到锁
    // 返回true：1.没有线程在等待锁；2.重入锁，线程本来就持有锁，也就可以理所当然可以直接获取
    protected final boolean tryAcquire(int acquires) {
        final Thread current = Thread.currentThread();
        int c = getState();
        // state == 0 此时此刻没有线程持有锁
        if (c == 0) {
            // 虽然此时此刻锁是可以用的，但是这是公平锁，既然是公平，就得讲究先来后到，
            // 看看有没有别人在队列中等了半天了
            if (!hasQueuedPredecessors() &&
                // 如果没有线程在等待，那就用CAS尝试一下，成功了就获取到锁了，
                // 不成功的话，只能说明一个问题，就在刚刚几乎同一时刻有个线程抢先了 =_=
                // 因为刚刚还没人的，我判断过了
                compareAndSetState(0, acquires)) {
              
                // 到这里就是获取到锁了，标记一下，告诉大家，现在是我占用了锁
                setExclusiveOwnerThread(current);
                return true;
            }
        }
          // 会进入这个else if分支，说明是重入了，需要操作：state=state+1
        // 这里不存在并发问题
        else if (current == getExclusiveOwnerThread()) {
            int nextc = c + acquires;
            if (nextc < 0)
                throw new Error("Maximum lock count exceeded");
            setState(nextc);
            return true;
        }
        // 如果到这里，说明前面的if和else if都没有返回true，说明没有获取到锁
        // 回到上面一个外层调用方法继续看:
        // if (!tryAcquire(arg) 
        //        && acquireQueued(addWaiter(Node.EXCLUSIVE), arg)) 
        //     selfInterrupt();
        return false;
    }
  
    // 假设tryAcquire(arg) 返回false，那么代码将执行：
      //		acquireQueued(addWaiter(Node.EXCLUSIVE), arg)，
    // 这个方法，首先需要执行：addWaiter(Node.EXCLUSIVE)
  

    // 此方法的作用是把线程包装成node，同时进入到队列中
    // 参数mode此时是Node.EXCLUSIVE，代表独占模式
    private Node addWaiter(Node mode) {
        Node node = new Node(Thread.currentThread(), mode);
        // Try the fast path of enq; backup to full enq on failure
        // 以下几行代码想把当前node加到链表的最后面去，也就是进到阻塞队列的最后
        Node pred = tail;
      
        // tail!=null => 队列不为空(tail==head的时候
        if (pred != null) { 
            // 将当前的队尾节点，设置为自己的前驱 
            node.prev = pred; 
            // 用CAS把自己设置为队尾, 如果成功后，tail == node 了，这个节点成为阻塞队列新的尾巴
            if (compareAndSetTail(pred, node)) { 
                // 进到这里说明设置成功，当前node==tail, 将自己与之前的队尾相连，
                // 上面已经有 node.prev = pred，加上下面这句，也就实现了和之前的尾节点双向连接了
                pred.next = node;
                // 线程入队了，可以返回了
                return node;
            }
        }
        // 仔细看看上面的代码，如果会到这里，
        // 说明 pred==null(队列是空的) 或者 CAS失败(有线程在竞争入队)
        enq(node);
        return node;
    }
  
    
    // 采用自旋的方式入队
    // 之前说过，到这个方法只有两种可能：等待队列为空，或者有线程竞争入队，
    // 自旋在这边的语义是：CAS设置tail过程中，竞争一次竞争不到，我就多次竞争，总会排到的
    private Node enq(final Node node) {
        for (;;) {
            Node t = tail;
            // 之前说过，队列为空也会进来这里
            if (t == null) { // Must initialize
                // 初始化head节点
                // 细心的读者会知道原来 head 和 tail 初始化的时候都是 null 的
                // 还是一步CAS，你懂的，现在可能是很多线程同时进来呢
                if (compareAndSetHead(new Node()))
                    // 给后面用：这个时候head节点的waitStatus==0, 看new Node()构造方法就知道了
                  
                    // 这个时候有了head，但是tail还是null，设置一下，
                    // 把tail指向head，放心，马上就有线程要来了，到时候tail就要被抢了
                    // 注意：这里只是设置了tail=head，这里可没return哦，没有return，没有return
                    // 所以，设置完了以后，继续for循环，下次就到下面的else分支了
                    tail = head;
            } else {
                // 下面几行，和上一个方法 addWaiter 是一样的，
                // 只是这个套在无限循环里，反正就是将当前线程排到队尾，有线程竞争的话排不上重复排
                node.prev = t;
                if (compareAndSetTail(t, node)) {
                    t.next = node;
                    return t;
                }
            }
        }
    }
    
  
    // 现在，又回到这段代码了
    // if (!tryAcquire(arg) 
    //        && acquireQueued(addWaiter(Node.EXCLUSIVE), arg)) 
    //     selfInterrupt();
    
    // 下面这个方法，参数node，经过addWaiter(Node.EXCLUSIVE)，此时已经进入阻塞队列
    // 注意一下：如果acquireQueued(addWaiter(Node.EXCLUSIVE), arg))返回true的话，
    // 意味着上面这段代码将进入selfInterrupt()，所以正常情况下，下面应该返回false
    // 这个方法非常重要，应该说真正的线程挂起，然后被唤醒后去获取锁，都在这个方法里了
    final boolean acquireQueued(final Node node, int arg) {
        boolean failed = true;
        try {
            boolean interrupted = false;
            for (;;) {
                final Node p = node.predecessor();
                // p == head 说明当前节点虽然进到了阻塞队列，但是是阻塞队列的第一个，因为它的前驱是head
                // 注意，阻塞队列不包含head节点，head一般指的是占有锁的线程，head后面的才称为阻塞队列
                // 所以当前节点可以去试抢一下锁
                // 这里我们说一下，为什么可以去试试：
                // 首先，它是队头，这个是第一个条件，其次，当前的head有可能是刚刚初始化的node，
                // enq(node) 方法里面有提到，head是延时初始化的，而且new Node()的时候没有设置任何线程
                // 也就是说，当前的head不属于任何一个线程，所以作为队头，可以去试一试，
                // tryAcquire已经分析过了, 忘记了请往前看一下，就是简单用CAS试操作一下state
                if (p == head && tryAcquire(arg)) {
                    setHead(node);
                    p.next = null; // help GC
                    failed = false;
                    return interrupted;
                }
                // 到这里，说明上面的if分支没有成功，要么当前node本来就不是队头，
                // 要么就是tryAcquire(arg)没有抢赢别人，继续往下看
                if (shouldParkAfterFailedAcquire(p, node) &&
                    parkAndCheckInterrupt())
                    interrupted = true;
            }
        } finally {
            // 什么时候 failed 会为 true???
            // tryAcquire() 方法抛异常的情况
            if (failed)
                cancelAcquire(node);
        }
    }
  
    // 刚刚说过，会到这里就是没有抢到锁呗，这个方法说的是："当前线程没有抢到锁，是否需要挂起当前线程？"
    // 第一个参数是前驱节点，第二个参数才是代表当前线程的节点
    private static boolean shouldParkAfterFailedAcquire(Node pred, Node node) {
        int ws = pred.waitStatus;
        // 前驱节点的 waitStatus == -1 ，说明前驱节点状态正常，当前线程需要挂起，直接可以返回true
        if (ws == Node.SIGNAL)
            /*
             * This node has already set status asking a release
             * to signal it, so it can safely park.
             */
            return true;
        
        // 前驱节点 waitStatus大于0 ，之前说过，大于0 说明前驱节点取消了排队。
        // 这里需要知道这点：进入阻塞队列排队的线程会被挂起，而唤醒的操作是由前驱节点完成的。
        // 所以下面这块代码说的是将当前节点的prev指向waitStatus<=0的节点，
        // 简单说，就是为了找个好爹，因为你还得依赖它来唤醒呢，如果前驱节点取消了排队，
        // 找前驱节点的前驱节点做爹，往前遍历总能找到一个好爹的
        if (ws > 0) {
            /*
             * Predecessor was cancelled. Skip over predecessors and
             * indicate retry.
             */
            do {
                node.prev = pred = pred.prev;
            } while (pred.waitStatus > 0);
            pred.next = node;
        } else {
            // 仔细想想，如果进入到这个分支意味着什么
            // 前驱节点的waitStatus不等于-1和1，那也就是只可能是0，-2，-3
            // 在我们前面的源码中，都没有看到有设置waitStatus的，所以每个新的node入队时，waitStatu都是0
            // 正常情况下，前驱节点是之前的 tail，那么它的 waitStatus 应该是 0
            // 用CAS将前驱节点的waitStatus设置为Node.SIGNAL(也就是-1)
            compareAndSetWaitStatus(pred, ws, Node.SIGNAL);
        }
        // 这个方法返回 false，那么会再走一次 for 循序，
        // 然后再次进来此方法，此时会从第一个分支返回 true
        return false;
    }
  
    // private static boolean shouldParkAfterFailedAcquire(Node pred, Node node)
    // 这个方法结束根据返回值我们简单分析下：
    // 如果返回true, 说明前驱节点的waitStatus==-1，是正常情况，那么当前线程需要被挂起，等待以后被唤醒
    //		我们也说过，以后是被前驱节点唤醒，就等着前驱节点拿到锁，然后释放锁的时候叫你好了
    // 如果返回false, 说明当前不需要被挂起，为什么呢？往后看
  
    // 跳回到前面是这个方法
    // if (shouldParkAfterFailedAcquire(p, node) &&
    //                parkAndCheckInterrupt())
    //                interrupted = true;
    
    // 1. 如果shouldParkAfterFailedAcquire(p, node)返回true，
    // 那么需要执行parkAndCheckInterrupt():
  
    // 这个方法很简单，因为前面返回true，所以需要挂起线程，这个方法就是负责挂起线程的
    // 这里用了LockSupport.park(this)来挂起线程，然后就停在这里了，等待被唤醒=======
    private final boolean parkAndCheckInterrupt() {
        LockSupport.park(this);
        return Thread.interrupted();
    }
  
    // 2. 接下来说说如果shouldParkAfterFailedAcquire(p, node)返回false的情况
  
   // 仔细看shouldParkAfterFailedAcquire(p, node)，我们可以发现，其实第一次进来的时候，一般都不会返回true的，原因很简单，前驱节点的waitStatus=-1是依赖于后继节点设置的。也就是说，我都还没给前驱设置-1呢，怎么可能是true呢，但是要看到，这个方法是套在循环里的，所以第二次进来的时候状态就是-1了。
}
```

acquireQueued方法的示意图：

<img src="https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/image-20250428163526368.png" alt="image-20250428163526368" style="zoom:50%;" />

shouldParkAfterFailedAcquire方法的示意图：

<img src="https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/image-20250428163657444.png" alt="image-20250428163657444" style="zoom: 50%;" />

unparkSuccessor方法的示意图：

<img src="https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/image-20250428163814786.png" alt="image-20250428163814786" style="zoom: 67%;" />

## 解锁过程

![image.png](https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/171d2d4332df6fd5~tplv-t2oaga2asx-image.image)

执行完后等待队列数据如下：

![image.png](https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/171d2d434393c58f~tplv-t2oaga2asx-image.image)

解锁的源码解析：

```java
// 唤醒的代码还是比较简单的，你如果上面加锁的都看懂了，下面都不需要看就知道怎么回事了
public void unlock() {
    sync.release(1);
}

public final boolean release(int arg) {
    if (tryRelease(arg)) {
        Node h = head;
        if (h != null && h.waitStatus != 0)
            unparkSuccessor(h);
        return true;
    }
    return false;
}

// 回到ReentrantLock看tryRelease方法
protected final boolean tryRelease(int releases) {
    int c = getState() - releases;
    if (Thread.currentThread() != getExclusiveOwnerThread())
        throw new IllegalMonitorStateException();
    // 是否完全释放锁
    boolean free = false;
    // 其实就是重入的问题，如果c==0，也就是说没有嵌套锁了，可以释放了，否则还不能释放掉
    if (c == 0) {
        free = true;
        setExclusiveOwnerThread(null);
    }
    setState(c);
    return free;
}

/**
 * Wakes up node's successor, if one exists.
 *
 * @param node the node
 */
// 唤醒后继节点
// 从上面调用处知道，参数node是head头结点
private void unparkSuccessor(Node node) {
    /*
     * If status is negative (i.e., possibly needing signal) try
     * to clear in anticipation of signalling.  It is OK if this
     * fails or if status is changed by waiting thread.
     */
    int ws = node.waitStatus;
    // 如果head节点当前waitStatus<0, 将其修改为0
    if (ws < 0)
        compareAndSetWaitStatus(node, ws, 0);
    /*
     * Thread to unpark is held in successor, which is normally
     * just the next node.  But if cancelled or apparently null,
     * traverse backwards from tail to find the actual
     * non-cancelled successor.
     */
    // 下面的代码就是唤醒后继节点，但是有可能后继节点取消了等待（waitStatus==1）
    // 从队尾往前找，找到waitStatus<=0的所有节点中排在最前面的
    Node s = node.next;
    if (s == null || s.waitStatus > 0) {
        s = null;
        // 从后往前找，仔细看代码，不必担心中间有节点取消(waitStatus==1)的情况
        for (Node t = tail; t != null && t != node; t = t.prev)
            if (t.waitStatus <= 0)
                s = t;
    }
    if (s != null)
        // 唤醒线程
        LockSupport.unpark(s.thread);
}
```

唤醒线程以后，被唤醒的线程将从以下代码中继续往前走：

```java
private final boolean parkAndCheckInterrupt() {
    LockSupport.park(this); // 刚刚线程被挂起在这里了
    return Thread.interrupted();
}
// 又回到这个方法了：acquireQueued(final Node node, int arg)，这个时候，node的前驱是head了
```

## 队列迁移过程

<img src="https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/image-20250428163936316.png" alt="image-20250428163936316" style="zoom: 50%;" />

## 独占锁总结

<img src="https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/1043908-20170102153259628-2038952452.gif" alt="img" style="zoom: 80%;" />
