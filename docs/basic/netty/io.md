# **网络通信编程基本常识**

## **什么是Socket？** 

**Socket**是应用层与TCP/IP协议族通信的中间软件抽象层，它是一组接口，一般由操作系统提供。在设计模式中，Socket其实就是一个门面模式，它把复杂的TCP/IP协议处理和通信缓存管理等等都隐藏在Socket接口后面，对用户来说，使用一组简单的接口就能进行网络应用编程，让Socket去组织数据，以符合指定的协议。主机 A 的应用程序要能和主机 B 的应用程序通信，必须通过 Socket 建立连接。

客户端连接上一个服务端，就会在客户端中产生一个socket接口实例，服务端每接受一个客户端连接，就会产生一个socket接口实例和客户端的socket进行通信，有多个客户端连接自然就有多个socket接口实例。

![image-20241226101053862](https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/202412261010943.png)

### **短连接**

连接->传输数据->关闭连接   传统HTTP是无状态的，浏览器和服务器每进行一次HTTP操作，就建立一次连接，但任务结束就中断连接。   也可以这样说：短连接是指SOCKET连接后发送后接收完数据后马上断开连接。

### **长连接**

连接->传输数据->保持连接 -> 传输数据-> 。。。 ->关闭连接。   长连接指建立SOCKET连接后不管是否使用都保持连接。

### **什么时候用长连接，短连接？**

长连接多用于操作频繁，点对点的通讯。每个TCP连接都需要三步握手，这需要时间，如果每个操作都是先连接，再操作的话那么处理速度会降低很多，所以每个操作完后都不断开，下次处理时直接发送数据包就OK了，不用建立TCP连接。例如：数据库的连接用长连接， 如果用短连接频繁的通信会造成socket错误，而且频繁的socket 创建也是对资源的浪费。

 而像WEB网站的http服务按照Http协议规范早期一般都用短链接，因为长连接对于服务端来说会耗费一定的资源，而像WEB网站这么频繁的成千上万甚至上亿客户端的连接用短连接会更省一些资源。但是现在的Http协议，Http1.1，尤其是Http2、Http3已经开始向长连接演化。

 总之，长连接和短连接的选择要视情况而定。

![image-20241226101112230](https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/202412261011303.png)

上述的场景和网络编程有很大的相似之处。

我们已经知道在通信编程里提供服务的叫服务端，连接服务端使用服务的叫客户端。在开发过程中，如果类的名字有Server或者ServerSocket的，表示这个类是给服务端容纳网络服务用的，如果类的名字只包含Socket的，那么表示这是负责具体的网络读写的。

那么对于服务端来说ServerSocket就只是个场所，就像上面的“东吴心理诊所”，它必须要绑定某个IP地址，就像“东吴心理诊所”在“图灵大街888号挂牌”，同时ServerSocket还需要监听某个端口，就像“申请了一个电话号码88888888”。

有电话进来了，具体和客户端沟通的还是一个一个的socket，就像“周瑜老师不懂心理咨询，于是通过内部分机把电话转给请来的心理医生A负责接待诸葛老师”，所以在通信编程里，ServerSocket并不负责具体的网络读写，ServerSocket就只是负责接收客户端连接后，新启一个socket来和客户端进行沟通。这一点对所有模式的通信编程都是适用的。

在通信编程里，我们关注的其实也就是三个事情：连接（客户端连接服务器，服务器等待和接收连接）、读网络数据、写网络数据，所有模式的通信编程都是围绕着这三件事情进行的。服务端提供IP和监听端口，客户端通过连接操作想服务端监听的地址发起连接请求，通过三次握手连接，如果连接成功建立，双方就可以通过套接字进行通信。

我们后面将学习的BIO和NIO其实都是处理上面三件事，只是处理的方式不一样。

# **Java网络编程模型**

## **原生JDK网络编程BIO** 

BIO，意为Blocking I/O，即阻塞的I/O。

BIO基本上就是我们上面所说的生活场景的朴素实现。在BIO中类ServerSocket负责绑定IP地址，启动监听端口，等待客户连接；客户端Socket类的实例发起连接操作，ServerSocket接受连接后产生一个新的服务端socket实例负责和客户端socket实例通过输入和输出流进行通信。

![image-20241226101133524](https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/202412261011785.png)

bio的阻塞，主要体现在两个地方。

①若一个服务器启动就绪，那么主线程就一直在等待着客户端的连接，这个等待过程中主线程就一直在阻塞。

②在连接建立之后，在读取到socket信息之前，线程也是一直在等待，一直处于阻塞的状态下的。 

这一点可以通过cn.tuling.bio下的ServerSingle.java服务端程序看出，启动该程序后，启动一个Client程序实例，并让这个Client阻塞住，位置就在向服务器输出具体请求之前，再启动一个新的Client程序实例，会发现尽管新的Client实例连接上了服务器，但是ServerSingle服务端程序仿佛无感知一样？为何，因为执行的主线程被阻塞了一直在等待第一个Client实例发送消息过来。

所以在BIO通信里，我们往往会在服务器的实现上结合线程来处理连接以及和客户端的通信。

传统BIO通信模型：采用BIO通信模型的服务端，通常由一个独立的Acceptor线程负责监听客户端的连接，它接收到客户端连接请求之后为每个客户端创建一个新的线程进行链路处理，处理完成后，通过输出流返回应答给客户端，线程销毁。即典型的一请求一应答模型，同时数据的读取写入也必须阻塞在一个线程内等待其完成。代码可见cn.tuling.bio.Server。

![image-20241226101148285](https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/202412261011326.png)

该模型最大的问题就是缺乏弹性伸缩能力，当客户端并发访问量增加后，服务端的线程个数和客户端并发访问数呈1:1的正比关系，Java中的线程也是比较宝贵的系统资源，线程数量快速膨胀后，系统的性能将急剧下降，随着访问量的继续增大，系统最终就**死掉了**。

为了改进这种一连接一线程的模型，我们可以使用线程池来管理这些线程，实现1个或多个线程处理N个客户端的模型（但是底层还是使用的同步阻塞I/O），通常被称为“伪异步I/O模型“。

我们知道，如果使用CachedThreadPool线程池（不限制线程数量，如果不清楚请参考文首提供的文章），其实除了能自动帮我们管理线程（复用），看起来也就像是1:1的客户端：线程数模型，而使用FixedThreadPool我们就有效的控制了线程的最大数量，保证了系统有限的资源的控制，实现了N:M的伪异步I/O模型。代码可见cn.tuling.bio.ServerPool。

![image-20241226101209897](https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/202412261012944.png)

但是，正因为限制了线程数量，如果发生读取数据较慢时（比如数据量大、网络传输慢等），大量并发的情况下，其他接入的消息，只能一直等待，这就是最大的弊端。

## **附录：BIO实战-手写RPC框架**

因为后面的Dubbo课程中，周瑜老师会带大家手写实现一个RPC框架，所以本节内容不会讲述，从笔记到代码都供大家自行学习和参考。

### **为什么要有RPC？** 

我们最开始开发的时候，一个应用一台机器，将所有功能都写在一起，比如说比较常见的电商场景，服务之间的调用就是我们最熟悉的普通本地方法调用。

随着我们业务的发展，我们需要提示性能了，我们会怎么做？将不同的业务功能放到线程里来实现异步和提升性能，但本质上还是本地方法调用。

![image-20241226101235746](https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/202412261012785.png)

但是业务越来越复杂，业务量越来越大，单个应用或者一台机器的资源是肯定背负不起的，这个时候，我们会怎么做？将核心业务抽取出来，作为独立的服务，放到其他服务器上或者形成集群。这个时候就会请出RPC，系统变为分布式的架构。

为什么说千万级流量分布式、微服务架构必备的RPC框架？和LocalCall的代码进行比较，因为引入rpc框架对我们现有的代码影响最小，同时又可以帮我们实现架构上的扩展。现在的开源rpc框架，有什么？dubbo，grpc等等 

当服务越来越多，各种rpc之间的调用会越来越复杂，这个时候我们会引入中间件，比如说MQ、缓存，同时架构上整体往微服务去迁移，引入了各种比如容器技术docker，DevOps等等。最终会变为如图所示来应付千万级流量，但是不管怎样，rpc总是会占有一席之地。

![image-20241226101247074](https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/202412261012164.png)

### **什么是RPC？**

RPC（Remote Procedure Call ——远程过程调用），它是一种通过网络从远程计算机程序上请求服务，而不需要了解底层网络的技术。

![image-20241226101257742](https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/202412261012847.png)

一次完整的RPC同步调用流程： 

1）服务消费方（client）以本地调用方式调用客户端存根； 

2）什么叫客户端存根？就是远程方法在本地的模拟对象，一样的也有方法名，也有方法参数，client stub接收到调用后负责将方法名、方法的参数等包装，并将包装后的信息通过网络发送到服务端； 

3）服务端收到消息后，交给代理存根在服务器的部分后进行解码为实际的方法名和参数 

4） server stub根据解码结果调用服务器上本地的实际服务；

5）本地服务执行并将结果返回给server stub； 

6）server stub将返回结果打包成消息并发送至消费方；

7）client stub接收到消息，并进行解码； 

8）服务消费方得到最终结果。

RPC框架的目标就是要中间步骤都封装起来，让我们进行远程方法调用的时候感觉到就像在本地方法调用一样。

### **RPC和HTTP** 

rpc字面意思就是远程过程调用，只是对不同应用间相互调用的一种描述，一种思想。具体怎么调用？实现方式可以是最直接的tcp通信，也可以是http方式，在很多的消息中间件的技术书籍里，甚至还有使用消息中间件来实现RPC调用的，我们知道的dubbo是基于tcp通信的，gRPC是Google公布的开源软件，基于最新的HTTP2.0协议，底层使用到了Netty框架的支持。所以总结来说，rpc和http是完全两个不同层级的东西，他们之间并没有什么可比性。

### **实现RPC框架**

#### **实现RPC框架需要解决的那些问题** 

#### **代理问题**

代理本质上是要解决什么问题？要解决的是被调用的服务本质上是远程的服务，但是调用者不知道也不关心，调用者只要结果，具体的事情由代理的那个对象来负责这件事。既然是远程代理，当然是要用代理模式了。

代理(Proxy)是一种设计模式,即通过代理对象访问目标对象.这样做的好处是:可以在目标对象实现的基础上,增强额外的功能操作,即扩展目标对象的功能。那我们这里额外的功能操作是干什么，通过网络访问远程服务。

jdk的代理有两种实现方式：静态代理和动态代理。

#### **序列化问题**

序列化问题在计算机里具体是什么？我们的方法调用，有方法名，方法参数，这些可能是字符串，可能是我们自己定义的java的类，但是在网络上传输或者保存在硬盘的时候，网络或者硬盘并不认得什么字符串或者javabean，它只认得二进制的01串，怎么办？要进行序列化，网络传输后要进行实际调用，就要把二进制的01串变回我们实际的java的类，这个叫反序列化。java里已经为我们提供了相关的机制Serializable。

#### **通信问题**

我们在用序列化把东西变成了可以在网络上传输的二进制的01串，但具体如何通过网络传输？使用JDK为我们提供的BIO。

#### **登记的服务实例化**

登记的服务有可能在我们的系统中就是一个名字，怎么变成实际执行的对象实例，当然是使用反射机制。

反射机制是什么？

反射机制是在运行状态中，对于任意一个类，都能够知道这个类的所有属性和方法；对于任意一个对象，都能够调用它的任意一个方法和属性；这种动态获取的信息以及动态调用对象的方法的功能称为java语言的反射机制。

反射机制能做什么?

反射机制主要提供了以下功能：

- 在运行时判断任意一个对象所属的类；
- 在运行时构造任意一个类的对象；
- 在运行时判断任意一个类所具有的成员变量和方法；
- 在运行时调用任意一个对象的方法；
- 生成动态代理。

## **原生JDK网络编程- NIO** 

### **什么是NIO？**

NIO 库是在 JDK 1.4 中引入的。NIO 弥补了原来的 BIO 的不足，它在标准 Java 代码中提供了高速的、面向块的 I/O。NIO被称为 no-blocking io 或者 new io都说得通。

#### **和BIO的主要区别**

#### **面向流与面向缓冲**

Java NIO和IO之间第一个最大的区别是，IO是面向流的，NIO是面向缓冲区的。 Java IO面向流意味着每次从流中读一个或多个字节，直至读取所有字节，它们没有被缓存在任何地方。此外，它不能前后移动流中的数据。如果需要前后移动从流中读取的数据，需要先将它缓存到一个缓冲区。 Java NIO的缓冲导向方法略有不同。数据读取到一个它稍后处理的缓冲区，需要时可在缓冲区中前后移动。这就增加了处理过程中的灵活性。但是，还需要检查是否该缓冲区中包含所有需要处理的数据。而且，需确保当更多的数据读入缓冲区时，不要覆盖缓冲区里尚未处理的数据。

#### **阻塞与非阻塞IO**

Java IO的各种流是阻塞的。这意味着，当一个线程调用read() 或 write()时，该线程被阻塞，直到有一些数据被读取，或数据完全写入。该线程在此期间不能再干任何事情了。

 Java NIO的非阻塞模式，使一个线程从某通道发送请求读取数据，但是它仅能得到目前可用的数据，如果目前没有数据可用时，就什么都不会获取。而不是保持线程阻塞，所以直至数据变的可以读取之前，该线程可以继续做其他的事情。 非阻塞写也是如此。一个线程请求写入一些数据到某通道，但不需要等待它完全写入，这个线程同时可以去做别的事情。 线程通常将非阻塞IO的空闲时间用于在其它通道上执行IO操作，所以一个单独的线程现在可以管理多个输入和输出通道（channel）。

### **NIO之Reactor模式** 

“反应”器名字中”反应“的由来：

“反应”即“倒置”，“控制逆转”,具体事件处理程序不调用反应器，而向反应器注册一个事件处理器，表示自己对某些事件感兴趣，有时间来了，具体事件处理程序通过事件处理器对某个指定的事件发生做出反应；这种控制逆转又称为“好莱坞法则”（不要调用我，让我来调用你）

例如，路人甲去做男士SPA，大堂经理负责服务，路人甲现在只对10000技师感兴趣，但是路人甲去的比较早，就告诉大堂经理，等10000技师上班了或者是空闲了，通知我。等路人甲接到大堂经理通知，做出了反应，把10000技师占住了。

然后，路人甲想起上一次的那个10000号房间不错，设备舒适，灯光暧昧，又告诉大堂经理，我对10000号房间很感兴趣，房间空出来了就告诉我，我现在先和10000这个小姐聊下人生，10000号房间空出来了，路人甲再次接到大堂经理通知，路人甲再次做出了反应。

路人甲就是具体事件处理程序，大堂经理就是所谓的反应器，“10000技师上班了”和“10000号房间空闲了”就是事件，路人甲只对这两个事件感兴趣，其他，比如10001号技师或者10002号房间空闲了也是事件，但是路人甲不感兴趣。

大堂经理不仅仅服务路人甲这个人，他还可以同时服务路人乙、丙……..，每个人所感兴趣的事件是不一样的，大堂经理会根据每个人感兴趣的事件通知对应的每个人。

![image-20241226101535004](https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/202412261015056.png)

### **NIO三大核心组件**

NIO有三大核心组件：Selector选择器、Channel管道、buffer缓冲区。

#### **Selector**

Selector的英文含义是“选择器”，也可以称为为“轮询代理器”、“事件订阅器”、“channel容器管理机”都行。

Java NIO的选择器允许一个单独的线程来监视多个输入通道，你可以注册多个通道使用一个选择器(Selectors)，然后使用一个单独的线程来操作这个选择器，进而“选择”通道：这些通道里已经有可以处理的输入，或者选择已准备写入的通道。这种选择机制，使得一个单独的线程很容易来管理多个通道。

应用程序将向Selector对象注册需要它关注的Channel，以及具体的某一个Channel会对哪些IO事件感兴趣。Selector中也会维护一个“已经注册的Channel”的容器。

#### **Channels**

通道，被建立的一个应用程序和操作系统交互事件、传递内容的渠道（注意是连接到操作系统）。那么既然是和操作系统进行内容的传递，那么说明应用程序可以通过通道读取数据，也可以通过通道向操作系统写数据，而且可以同时进行读写。

- 所有被Selector（选择器）注册的通道，只能是继承了SelectableChannel类的子类。
- ServerSocketChannel：应用服务器程序的监听通道。只有通过这个通道，应用程序才能向操作系统注册支持“多路复用IO”的端口监听。同时支持UDP协议和TCP协议。
- ScoketChannel：TCP Socket套接字的监听通道，一个Socket套接字对应了一个客户端IP：端口 到 服务器IP：端口的通信连接。

通道中的数据总是要先读到一个Buffer，或者总是要从一个Buffer中写入。

#### **buffer缓冲区**

我们前面说过JDK NIO是面向缓冲的。Buffer就是这个缓冲，用于和NIO通道进行交互。数据是从通道读入缓冲区，从缓冲区写入到通道中的。以写为例，应用程序都是将数据写入缓冲，再通过通道把缓冲的数据发送出去，读也是一样，数据总是先从通道读到缓冲，应用程序再读缓冲的数据。

缓冲区本质上是一块可以写入数据，然后可以从中读取数据的内存（其实就是数组）。这块内存被包装成NIO Buffer对象，并提供了一组方法，用来方便的访问该块内存。

后面的附录详细讲到其中的api等相关内容。

![image-20241226101554809](https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/202412261015871.png)

#### **实现代码**

![image-20241226101604551](https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/202412261016590.png)

Selector对象是通过调用静态工厂方法open()来实例化的，如下：

```java
Selector Selector = Selector.open()；
```

要实现Selector管理Channel，需要将channel注册到相应的Selector上，如下：

```java
channel.configureBlocking(false);

SelectionKey key= channel.register(selector,SelectionKey,OP_READ);
```

通过调用通道的register()方法会将它注册到一个选择器上。与Selector一起使用时，Channel必须处于非阻塞模式下，否则将抛出IllegalBlockingModeException异常，这意味着不能将FileChannel与Selector一起使用，因为FileChannel不能切换到非阻塞模式，而套接字通道都可以。另外通道一旦被注册，将不能再回到阻塞状态，此时若调用通道的configureBlocking(true)将抛出BlockingModeException异常。

register()方法的第二个参数是“interest集合”，表示选择器所关心的通道操作，它实际上是一个表示选择器在检查通道就绪状态时需要关心的操作的比特掩码。比如一个选择器对通道的read和write操作感兴趣，那么选择器在检查该通道时，只会检查通道的read和write操作是否已经处在就绪状态。

具体的操作类型和通道上能被支持的操作类型前面已经讲述过。

如果Selector对通道的多操作类型感兴趣，可以用“位或”操作符来实现：

```java
int interestSet=SelectionKey.OP_READ|SelectionKey.OP_WRITE;
```

同时 一个 Channel 仅仅可以被注册到一个 Selector 一次, 如果将 Channel 注册到 Selector 多次, 那么其实就是相当于更新 SelectionKey 的 interest set。

通过SelectionKey可以判断Selector是否对Channel的某种事件感兴趣，比如

int interestSet = selectionKey.interestOps(); 

boolean isInterestedInAccept = (interestSet & SelectionKey.OP_ACCEPT) == SelectionKey.OP_ACCEPT；

通过SelctionKey对象的readyOps()来获取相关通道已经就绪的操作。它是interest集合的子集，并且表示了interest集合中从上次调用select()以后已经就绪的那些操作。JAVA中定义几个方法用来检查这些操作是否就绪，比如selectionKey.isAcceptable();

同时，通过SelectionKey可以取出这个SelectionKey所关联的Selector和Channel。

如果我们要取消关联关系，怎么办？SelectionKey对象的cancel()方法来取消特定的注册关系。

在实际的应用中，我们还可以为SelectionKey绑定附加对象，在需要的时候取出。

SelectionKey key=channel.register(selector,SelectionKey.OP_READ,theObject);

或selectionKey.attach(theObject);

取出这个附加对象，通过：

```java
Object attachedObj = key.attachment();
```

在实际运行中，我们通过Selector的select（）方法可以选择已经准备就绪的通道（这些通道包含你感兴趣的的事件）。

下面是Selector几个重载的select()方法：

select():阻塞到至少有一个通道在你注册的事件上就绪了。

select(long timeout)：和select()一样，但最长阻塞事件为timeout毫秒。

selectNow():非阻塞，立刻返回。

select()方法返回的int值表示有多少通道已经就绪,是自上次调用select()方法后有多少通道变成就绪状态。

一旦调用select()方法，并且返回值不为0时，则可以通过调用Selector的selectedKeys()方法来访问已选择键集合。

Set selectedKeys=selector.selectedKeys();

这个时候，循环遍历selectedKeys集中的每个键，并检测各个键所对应的通道的就绪事件，再通过SelectionKey关联的Selector和Channel进行实际的业务处理。

注意每次迭代末尾的keyIterator.remove()调用。Selector不会自己从已选择键集中移除SelectionKey实例。必须在处理完通道时自己移除，否则的话，下次该通道变成就绪时，Selector会再次将其放入已选择键集中。

**具体与NIO编程相关的代码参见模块nio下包cn.tuling.nio.nio。从服务端的代码我们可以看到，我们仅用了一个线程就处理了多个客户端的的连接。**

### **重要概念SelectionKey**

#### **什么是SelectionKey**

SelectionKey是一个抽象类,表示selectableChannel在Selector中注册的标识.每个Channel向Selector注册时,都将会创建一个SelectionKey。SelectionKey将Channel与Selector建立了关系，并维护了channel事件。

可以通过cancel方法取消键,取消的键不会立即从selector中移除,而是添加到cancelledKeys中,在下一次select操作时移除它.所以在调用某个key时,需要使用isValid进行校验.

#### **SelectionKey类型和就绪条件**

在向Selector对象注册感兴趣的事件时，JAVA NIO共定义了四种：OP_READ、OP_WRITE、OP_CONNECT、OP_ACCEPT（定义在SelectionKey中），分别对应读、写、请求连接、接受连接等网络Socket操作。

| **操作类型** | **就绪条件及说明**                                           |
| ------------ | ------------------------------------------------------------ |
| OP_READ      | 当操作系统读缓冲区有数据可读时就绪。并非时刻都有数据可读，所以一般需要注册该操作，仅当有就绪时才发起读操作，有的放矢，避免浪费CPU。 |
| OP_WRITE     | 当操作系统写缓冲区有空闲空间时就绪。一般情况下写缓冲区都有空闲空间，小块数据直接写入即可，没必要注册该操作类型，否则该条件不断就绪浪费CPU；但如果是写密集型的任务，比如文件下载等，缓冲区很可能满，注册该操作类型就很有必要，同时注意写完后取消注册。 |
| OP_CONNECT   | 当SocketChannel.connect()请求连接成功后就绪。该操作只给客户端使用。 |
| OP_ACCEPT    | 当接收到一个客户端连接请求时就绪。该操作只给服务器使用。     |

关于OP_WRITE的相关代码可以参见包cn.tuling.nio.nio.writeable

#### **服务端和客户端分别感兴趣的类型**

ServerSocketChannel和SocketChannel可以注册自己感兴趣的操作类型，当对应操作类型的就绪条件满足时OS会通知channel，下表描述各种Channel允许注册的操作类型，Y表示允许注册，N表示不允许注册，其中服务器SocketChannel指由服务器ServerSocketChannel.accept()返回的对象。

|                           | OP_READ | OP_WRITE | OP_CONNECT | OP_ACCEPT |
| ------------------------- | ------- | -------- | ---------- | --------- |
| 服务器ServerSocketChannel |         |          |            | **Y**     |
| 服务器SocketChannel       | **Y**   | **Y**    |            |           |
| 客户端SocketChannel       | **Y**   | **Y**    | **Y**      |           |

服务器启动ServerSocketChannel，关注OP_ACCEPT事件，

客户端启动SocketChannel，连接服务器，关注OP_CONNECT事件

服务器接受连接，启动一个服务器的SocketChannel，这个SocketChannel可以关注OP_READ、OP_WRITE事件，一般连接建立后会直接关注OP_READ事件

客户端这边的客户端SocketChannel发现连接建立后，可以关注OP_READ、OP_WRITE事件，一般是需要客户端需要发送数据了才关注OP_READ事件

连接建立后客户端与服务器端开始相互发送消息（读写），根据实际情况来关注OP_READ、OP_WRITE事件。

### **附录- Buffer详解** 

#### **重要属性**

#### **capacity**

作为一个内存块，Buffer有一个固定的大小值，也叫“capacity”.你只能往里写capacity个byte、long，char等类型。一旦Buffer满了，需要将其清空（通过读数据或者清除数据）才能继续写数据往里写数据。

#### **position**

当你写数据到Buffer中时，position表示当前能写的位置。初始的position值为0.当一个byte、long等数据写到Buffer后， position会向前移动到下一个可插入数据的Buffer单元。position最大可为capacity – 1.

当读取数据时，也是从某个特定位置读。当将Buffer从写模式切换到读模式，position会被重置为0. 当从Buffer的position处读取数据时，position向前移动到下一个可读的位置。

#### **limit**

在写模式下，Buffer的limit表示你最多能往Buffer里写多少数据。 写模式下，limit等于Buffer的capacity。

当切换Buffer到读模式时， limit表示你最多能读到多少数据。因此，当切换Buffer到读模式时，limit会被设置成写模式下的position值。换句话说，你能读到之前写入的所有数据（limit被设置成已写数据的数量，这个值在写模式下就是position）

#### **Buffer的分配**

要想获得一个Buffer对象首先要进行分配。 每一个Buffer类都有**allocate**方法(可以在堆上分配，也可以在直接内存上分配)。

分配48字节capacity的ByteBuffer的例子:ByteBuffer buf = ByteBuffer.allocate(48);

分配一个可存储1024个字符的CharBuffer：CharBuffer buf = CharBuffer.allocate(1024);

**wrap方法**：把一个byte数组或byte数组的一部分包装成ByteBuffer：

ByteBuffer wrap(byte [] array)

ByteBuffer wrap(byte [] array, int offset, int length) 

#### **直接内存**

HeapByteBuffer与DirectByteBuffer，在原理上，前者可以看出分配的buffer是在heap区域的，其实真正flush到远程的时候会先拷贝到直接内存，再做下一步操作；在NIO的框架下，很多框架会采用DirectByteBuffer来操作，这样分配的内存不再是在java heap上，经过性能测试，可以得到非常快速的网络交互，在大量的网络交互下，一般速度会比HeapByteBuffer要快速好几倍。

直接内存（Direct Memory）并不是虚拟机运行时数据区的一部分，也不是Java虚拟机规范中定义的内存区域，但是这部分内存也被频繁地使用，而且也可能导致OutOfMemoryError 异常出现。 

NIO可以使用Native 函数库直接分配堆外内存，然后通过一个存储在Java 堆里面的DirectByteBuffer 对象作为这块内存的引用进行操作。这样能在一些场景中显著提高性能，因为避免了在Java 堆和Native 堆中来回复制数据。

#### **直接内存（堆外内存）与堆内存比较**

直接内存申请空间耗费更高的性能，当频繁申请到一定量时尤为明显

直接内存IO读写的性能要优于普通的堆内存，在多次读写操作的情况下差异明显

#### **Buffer的读写**

#### **向Buffer中写数据**

**写数据到Buffer有两种方式：**

- **读取Channel写到Buffer。**
- **通过Buffer的put()方法写到Buffer里。**

从Channel写到Buffer的例子

**int** bytesRead = inChannel.read(buf); //read into buffer.

通过put方法写Buffer的例子：

buf.put(127);

put方法有很多版本，允许你以不同的方式把数据写入到Buffer中。例如， 写到一个指定的位置，或者把一个字节数组写入到Buffer。在比如：

put(byte b)	相对写，向position的位置写入一个byte，并将postion+1，为下次读写作准备。

#### **flip()方法**

flip方法将Buffer从写模式切换到读模式。调用flip()方法会将position设回0，并将limit设置成之前position的值。

换句话说，position现在用于标记读的位置，limit表示之前写进了多少个byte、char等 —— 现在能读取多少个byte、char等。

#### **从Buffer中读取数据**

**从Buffer中读取数据有两种方式：**

1. **从Buffer读取数据写入到Channel。**
2. **使用get()方法从Buffer中读取数据。**

从Buffer读取数据到Channel的例子：

**int** bytesWritten = inChannel.write(buf);

使用get()方法从Buffer中读取数据的例子

**byte** aByte = buf.get();

get方法有很多版本，允许你以不同的方式从Buffer中读取数据。例如，从指定position读取，或者从Buffer中读取数据到字节数组，再比如

get()属于相对读，从position位置读取一个byte，并将position+1，为下次读写作准备;

#### **使用Buffer读写数据常见步骤**

1. 写入数据到Buffer
2. 调用flip()方法
3. 从Buffer中读取数据
4. 调用clear()方法或者compact()方法，准备下一次的写入

当向buffer写入数据时，buffer会记录下写了多少数据。一旦要读取数据，需要通过flip()方法将Buffer从写模式切换到读模式。在读模式下，可以读取之前写入到buffer的所有数据。

一旦读完了所有的数据，就需要清空缓冲区，让它可以再次被写入。有两种方式能清空缓冲区：调用clear()或compact()方法。clear()方法会清空整个缓冲区。compact()方法只会清除已经读过的数据。

#### **其他常用操作**

**绝对读写**

put(int index, byte b)	绝对写，向byteBuffer底层的bytes中下标为index的位置插入byte b，不改变position的值。

 get(int index)属于绝对读，读取byteBuffer底层的bytes中下标为index的byte，不改变position。

更多Buffer实现的细节参考JavaDoc。

**rewind()方法**

Buffer.rewind()将position设回0，所以你可以重读Buffer中的所有数据。limit保持不变，仍然表示能从Buffer中读取多少个元素（byte、char等）。

**clear()与compact()方法**

一旦读完Buffer中的数据，需要让Buffer准备好再次被写入。可以通过clear()或compact()方法来完成。

如果调用的是clear()方法，position将被设回0，limit被设置成 capacity的值。换句话说，Buffer 被清空了。Buffer中的数据并未清除，只是这些标记告诉我们可以从哪里开始往Buffer里写数据。

如果Buffer中有一些未读的数据，调用clear()方法，数据将“被遗忘”，意味着不再有任何标记会告诉你哪些数据被读过，哪些还没有。

如果Buffer中仍有未读的数据，且后续还需要这些数据，但是此时想要先先写些数据，那么使用compact()方法。

compact()方法将所有未读的数据拷贝到Buffer起始处。然后将position设到最后一个未读元素正后面。limit属性依然像clear()方法一样，设置成capacity。现在Buffer准备好写数据了，但是不会覆盖未读的数据。

**mark()与reset()方法**

通过调用Buffer.mark()方法，可以标记Buffer中的一个特定position。之后可以通过调用Buffer.reset()方法恢复到这个position。例如：

buffer.mark();//call buffer.get() a couple of times, e.g. during parsing.

buffer.reset(); //set position back to mark.

**equals()与compareTo()方法**

可以使用equals()和compareTo()方法两个Buffer。

**equals()**

当满足下列条件时，表示两个Buffer相等：

1. 有相同的类型（byte、char、int等）。
2. Buffer中剩余的byte、char等的个数相等。
3. Buffer中所有剩余的byte、char等都相同。

如你所见，equals只是比较Buffer的一部分，不是每一个在它里面的元素都比较。实际上，它只比较Buffer中的剩余元素。

**compareTo()方法**

compareTo()方法比较两个Buffer的剩余元素(byte、char等)， 如果满足下列条件，则认为一个Buffer“小于”另一个Buffer：

1. 第一个不相等的元素小于另一个Buffer中对应的元素 。
2. 所有元素都相等，但第一个Buffer比另一个先耗尽(第一个Buffer的元素个数比另一个少)。

#### **Buffer方法总结**

| limit(), limit(10)等                    | 其中读取和设置这4个属性的方法的命名和jQuery中的val(),val(10)类似，一个负责get，一个负责set |
| --------------------------------------- | ------------------------------------------------------------ |
| reset()                                 | 把position设置成mark的值，相当于之前做过一个标记，现在要退回到之前标记的地方 |
| clear()                                 | position = 0;limit = capacity;mark = -1; 有点初始化的味道，但是并不影响底层byte数组的内容 |
| flip()                                  | limit = position;position = 0;mark = -1; 翻转，也就是让flip之后的position到limit这块区域变成之前的0到position这块，翻转就是将一个处于存数据状态的缓冲区变为一个处于准备取数据的状态 |
| rewind()                                | 把position设为0，mark设为-1，不改变limit的值                 |
| remaining()                             | return limit - position;返回limit和position之间相对位置差    |
| hasRemaining()                          | return position < limit返回是否还有未读内容                  |
| compact()                               | 把从position到limit中的内容移到0到limit-position的区域内，position和limit的取值也分别变成limit-position、capacity。如果先将positon设置到limit，再compact，那么相当于clear() |
| get()                                   | 相对读，从position位置读取一个byte，并将position+1，为下次读写作准备 |
| get(int index)                          | 绝对读，读取byteBuffer底层的bytes中下标为index的byte，不改变position |
| get(byte[] dst, int offset, int length) | 从position位置开始相对读，读length个byte，并写入dst下标从offset到offset+length的区域 |
| put(byte b)                             | 相对写，向position的位置写入一个byte，并将postion+1，为下次读写作准备 |
| put(int index, byte b)                  | 绝对写，向byteBuffer底层的bytes中下标为index的位置插入byte b，不改变position |
| put(ByteBuffer src)                     | 用相对写，把src中可读的部分（也就是position到limit）写入此byteBuffer |
| put(byte[] src, int offset, int length) | 从src数组中的offset到offset+length区域读取数据并使用相对写写入此byteBuffer |

Buffer相关的代码参见模块nio下包cn.tuling.nio.buffer

## **Reactor模式类型**

### **单线程Reactor模式流程：**

② 客户端向服务器端发起一个连接请求，Reactor监听到了该ACCEPT事件的发生并将该ACCEPT事件派发给相应的Acceptor处理器来进行处理。Acceptor处理器通过accept()方法得到与这个客户端对应的连接(SocketChannel)，然后将该连接所关注的READ事件以及对应的READ事件处理器注册到Reactor中，这样一来Reactor就会监听该连接的READ事件了。

③ 当Reactor监听到有读或者写事件发生时，将相关的事件派发给对应的处理器进行处理。比如，读处理器会通过SocketChannel的read()方法读取数据，此时read()操作可以直接读取到数据，而不会堵塞与等待可读的数据到来。

④ 每当处理完所有就绪的感兴趣的I/O事件后，Reactor线程会再次执行select()阻塞等待新的事件就绪并将其分派给对应处理器进行处理。

注意，Reactor的单线程模式的单线程主要是针对于I/O操作而言，也就是所有的I/O的accept()、read()、write()以及connect()操作都在一个线程上完成的。

但在目前的单线程Reactor模式中，不仅I/O操作在该Reactor线程上，连非I/O的业务操作也在该线程上进行处理了，这可能会大大延迟I/O请求的响应。所以我们应该将非I/O的业务逻辑操作从Reactor线程上卸载，以此来加速Reactor线程对I/O请求的响应。

![image-20241226101752735](https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/202412261017789.png)

### **单线程Reactor，工作者线程池**

与单线程Reactor模式不同的是，添加了一个工作者线程池，并将非I/O操作从Reactor线程中移出转交给工作者线程池来执行。这样能够提高Reactor线程的I/O响应，不至于因为一些耗时的业务逻辑而延迟对后面I/O请求的处理。

使用线程池的优势：

① 通过重用现有的线程而不是创建新线程，可以在处理多个请求时分摊在线程创建和销毁过程产生的巨大开销。

② 另一个额外的好处是，当请求到达时，工作线程通常已经存在，因此不会由于等待创建线程而延迟任务的执行，从而提高了响应性。

③ 通过适当调整线程池的大小，可以创建足够多的线程以便使处理器保持忙碌状态。同时还可以防止过多线程相互竞争资源而使应用程序耗尽内存或失败。

改进的版本中，所以的I/O操作依旧由一个Reactor来完成，包括I/O的accept()、read()、write()以及connect()操作。

对于一些小容量应用场景，可以使用单线程模型。但是对于高负载、大并发或大数据量的应用场景却不合适，主要原因如下：

① 一个NIO线程同时处理成百上千的链路，性能上无法支撑，即便NIO线程的CPU负荷达到100%，也无法满足海量消息的读取和发送；

② 当NIO线程负载过重之后，处理速度将变慢，这会导致大量客户端连接超时，超时之后往往会进行重发，这更加重了NIO线程的负载，最终会导致大量消息积压和处理超时，成为系统的性能瓶颈；

![image-20241226101807487](https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/202412261018548.png)

### **多线程主从Reactor模式**

Reactor线程池中的每一Reactor线程都会有自己的Selector、线程和分发的事件循环逻辑。

mainReactor可以只有一个，但subReactor一般会有多个。mainReactor线程主要负责接收客户端的连接请求，然后将接收到的SocketChannel传递给subReactor，由subReactor来完成和客户端的通信。

流程：

① 注册一个Acceptor事件处理器到mainReactor中，Acceptor事件处理器所关注的事件是ACCEPT事件，这样mainReactor会监听客户端向服务器端发起的连接请求事件(ACCEPT事件)。启动mainReactor的事件循环。

② 客户端向服务器端发起一个连接请求，mainReactor监听到了该ACCEPT事件并将该ACCEPT事件派发给Acceptor处理器来进行处理。Acceptor处理器通过accept()方法得到与这个客户端对应的连接(SocketChannel)，然后将这个SocketChannel传递给subReactor线程池。

③ subReactor线程池分配一个subReactor线程给这个SocketChannel，即，将SocketChannel关注的READ事件以及对应的READ事件处理器注册到subReactor线程中。当然你也注册WRITE事件以及WRITE事件处理器到subReactor线程中以完成I/O写操作。Reactor线程池中的每一Reactor线程都会有自己的Selector、线程和分发的循环逻辑。

④ 当有I/O事件就绪时，相关的subReactor就将事件派发给响应的处理器处理。注意，这里subReactor线程只负责完成I/O的read()操作，在读取到数据后将业务逻辑的处理放入到线程池中完成，若完成业务逻辑后需要返回数据给客户端，则相关的I/O的write操作还是会被提交回subReactor线程来完成。

注意，所以的I/O操作(包括，I/O的accept()、read()、write()以及connect()操作)依旧还是在Reactor线程(mainReactor线程 或 subReactor线程)中完成的。Thread Pool(线程池)仅用来处理非I/O操作的逻辑。

多Reactor线程模式将“接受客户端的连接请求”和“与该客户端的通信”分在了两个Reactor线程来完成。mainReactor完成接收客户端连接请求的操作，它不负责与客户端的通信，而是将建立好的连接转交给subReactor线程来完成与客户端的通信，这样一来就不会因为read()数据量太大而导致后面的客户端连接请求得不到即时处理的情况。并且多Reactor线程模式在海量的客户端并发请求的情况下，还可以通过实现subReactor线程池来将海量的连接分发给多个subReactor线程，在多核的操作系统中这能大大提升应用的负载和吞吐量。

![image-20241226101823209](https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/202412261018281.png)

### **和观察者模式的区别**

**观察者模式：** 　也可以称为为 发布-订阅 模式，主要适用于多个对象依赖某一个对象的状态并，当某对象状态发生改变时，要通知其他依赖对象做出更新。是一种一对多的关系。当然，如果依赖的对象只有一个时，也是一种特殊的一对一关系。通常，观察者模式适用于消息事件处理，监听者监听到事件时通知事件处理者对事件进行处理（这一点上面有点像是回调，容易与反应器模式和前摄器模式的回调搞混淆）**。 Reactor模**式： 　reactor模式，即反应器模式，是一种高效的异步IO模式，特征是回调，当IO完成时，回调对应的函数进行处理。这种模式并非是真正的异步，而是运用了异步的思想，当IO事件触发时，通知应用程序作出IO处理。模式本身并不调用系统的异步IO函数。

reactor模式与观察者模式有点像。不过，观察者模式与单个事件源关联，而反应器模式则与多个事件源关联 。当一个主体发生改变时，所有依属体都得到通知。

# **直接内存深入辨析**

在所有的网络通信和应用程序中，每个TCP的Socket的内核中都有一个发送缓冲区(SO_SNDBUF)和一个接收缓冲区(SO_RECVBUF)，可以使用相关套接字选项来更改该缓冲区大小。

![image-20241226101852818](https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/202412261018871.png)

当某个应用进程调用write时，内核从该应用进程的缓冲区中复制所有数据到所写套接字的发送缓冲区。如果该套接字的发送缓冲区容不下该应用进程的所有数据(或是应用进程的缓冲区大于套接字的发送缓冲区，或是套接字的发送缓冲区中已有其他数据)，假设该套接字是阻塞的，则该应用进程将被投入睡眠。

内核将不从write系统调用返回，直到应用进程缓冲区中的所有数据都复制到套接字发送缓冲区。因此，从写一个TCP套接字的write调用成功返回仅仅表示我们可以重新使用原来的应用进程缓冲区，并不表明对端的TCP或应用进程已接收到数据。

![image-20241226101901415](https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/202412261019468.png)

Java程序自然也要遵守上述的规则。但在Java中存在着堆、垃圾回收等特性，所以在实际的IO中，在JVM内部的存在着这样一种机制：

在IO读写上，如果是使用堆内存，JDK会先创建一个DirectBuffer，再去执行真正的写操作。这是因为，当我们把一个地址通过JNI传递给底层的C库的时候，有一个基本的要求，就是这个地址上的内容不能失效。然而，在GC管理下的对象是会在Java堆中移动的。也就是说，有可能我把一个地址传给底层的write，但是这段内存却因为GC整理内存而失效了。所以必须要把待发送的数据放到一个GC管不着的地方。这就是调用native方法之前，数据—定要在堆外内存的原因。

可见，站在网络通信的角度DirectBuffer并没有节省什么内存拷贝，只是Java网络通信里因为HeapBuffer必须多做一次拷贝，使用DirectBuffer就会少一次内存拷贝。相比没有使用堆内存的Java程序，使用直接内存的Java程序当然更快一点。

从垃圾回收的角度而言，直接内存不受 GC(新生代的 Minor GC) 影响，只有当执行老年代的 Full GC 时候才会顺便回收直接内存，整理内存的压力也比数据放到HeapBuffer要小。

## **堆外内存的优点和缺点**

堆外内存相比于堆内内存有几个优势： 　

- 减少了垃圾回收的工作，因为垃圾回收会暂停其他的工作（可能使用多线程或者时间片的方式，根本感觉不到）
- 加快了复制的速度。因为堆内在flush到远程时，会先复制到直接内存（非堆内存），然后在发送；而堆外内存相当于省略掉了这个工作。 　　

而福之祸所依，自然也有不好的一面： 　　

- 堆外内存难以控制，如果内存泄漏，那么很难排查 
-  堆外内存相对来说，不适合存储很复杂的对象。一般简单的对象或者扁平化的比较适合。

## **零拷贝**

### **什么是零拷贝?**

零拷贝(英语: Zero-copy) 技术是指计算机执行操作时，CPU不需要先将数据从某处内存复制到另一个特定区域。这种技术通常用于通过网络传输文件时节省CPU周期和内存带宽。

➢零拷贝技术可以减少数据拷贝和共享总线操作的次数，消除传输数据在存储器之间不必要的中间拷贝次数，从而有效地提高数据传输效率

➢零拷贝技术减少了用户进程地址空间和内核地址空间之间因为上:下文切换而带来的开销

可以看出没有说不需要拷贝，只是说减少冗余[不必要]的拷贝。

下面这些组件、框架中均使用了零拷贝技术：Kafka、Netty、Rocketmq、Nginx、Apache。

### **Linux的I/O机制与DMA**

在早期计算机中，用户进程需要读取磁盘数据，需要CPU中断和CPU参与，因此效率比较低，发起IO请求，每次的IO中断，都带来CPU的上下文切换。因此出现了——DMA。

DMA(Direct Memory Access，直接内存存取) 是所有现代电脑的重要特色，它允许不同速度的硬件装置来沟通，而不需要依赖于CPU 的大量中断负载。

DMA控制器，接管了数据读写请求，减少CPU的负担。这样一来，CPU能高效工作了。现代硬盘基本都支持DMA。

实际因此IO读取，涉及两个过程：

1、DMA等待数据准备好，把磁盘数据读取到操作系统内核缓冲区；

2、用户进程，将内核缓冲区的数据copy到用户空间。

### **传统数据传送机制**

比如：读取文件，再用socket发送出去，实际经过四次copy。

伪码实现如下：

buffer = File.read() 

Socket.send(buffer)

1、第一次：将磁盘文件，读取到操作系统内核缓冲区；

2、第二次：将内核缓冲区的数据，copy到应用程序的buffer；

3、第三步：将application应用程序buffer中的数据，copy到socket网络发送缓冲区(属于操作系统内核的缓冲区)；

4、第四次：将socket buffer的数据，copy到网卡，由网卡进行网络传输。

![image-20241226101922964](https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/202412261019029.png)

分析上述的过程，虽然引入DMA来接管CPU的中断请求，但四次copy是存在“不必要的拷贝”的。实际上并不需要第二个和第三个数据副本。应用程序除了缓存数据并将其传输回套接字缓冲区之外什么都不做。相反，数据可以直接从读缓冲区传输到套接字缓冲区。

显然，第二次和第三次数据copy 其实在这种场景下没有什么帮助反而带来开销，这也正是零拷贝出现的背景和意义。

同时，read和send都属于系统调用，每次调用都牵涉到两次上下文切换：

![image-20241226101933520](https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/202412261019578.png)

总结下，传统的数据传送所消耗的成本：4次拷贝，4次上下文切换。

4次拷贝，其中两次是DMA copy，两次是CPU copy。

### **Linux支持的(常见)零拷贝**

目的：减少IO流程中不必要的拷贝，当然零拷贝需要OS支持，也就是需要kernel暴露api。

#### **mmap内存映射**

 硬盘上文件的位置和应用程序缓冲区(application buffers)进行映射（建立一种一一对应关系），由于mmap()将文件直接映射到用户空间，所以实际文件读取时根据这个映射关系，直接将文件从硬盘拷贝到用户空间，只进行了一次数据拷贝，不再有文件内容从硬盘拷贝到内核空间的一个缓冲区。

mmap内存映射将会经历：3次拷贝: 1次cpu copy，2次DMA copy；

以及4次上下文切换，调用mmap函数2次，write函数2次。

![image-20241226102012442](https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/202412261020499.png)

#### **sendfile**

linux 2.1支持的sendfile

当调用sendfile()时，DMA将磁盘数据复制到kernel buffer，然后将内核中的kernel buffer直接拷贝到socket buffer；但是数据并未被真正复制到socket关联的缓冲区内。取而代之的是，只有记录数据位置和长度的描述符被加入到socket缓冲区中。DMA模块将数据直接从内核缓冲区传递给协议引擎，从而消除了遗留的最后一次复制。但是要注意，这个需要DMA硬件设备支持，如果不支持，CPU就必须介入进行拷贝。

一旦数据全都拷贝到socket buffer，sendfile()系统调用将会return、代表数据转化的完成。socket buffer里的数据就能在网络传输了。

sendfile会经历：3（2，如果硬件设备支持）次拷贝，1（0，，如果硬件设备支持）次CPU copy， 2次DMA copy；

以及2次上下文切换

![image-20241226102026767](https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/202412261020820.png)

#### **splice**

Linux 从2.6.17 支持splice

数据从磁盘读取到OS内核缓冲区后，在内核缓冲区直接可将其转成内核空间其他数据buffer，而不需要拷贝到用户空间。

如下图所示，从磁盘读取到内核buffer后，在内核空间直接与socket buffer建立pipe管道。

和sendfile()不同的是，splice()不需要硬件支持。

注意splice和sendfile的不同，sendfile是DMA硬件设备不支持的情况下将磁盘数据加载到kernel buffer后，需要一次CPU copy，拷贝到socket buffer。而splice是更进一步，连这个CPU copy也不需要了，直接将两个内核空间的buffer进行pipe。

splice会经历 2次拷贝: 0次cpu copy 2次DMA copy；

以及2次上下文切换

![image-20241226102038837](https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/202412261020888.png)

#### **总结Linux中零拷贝**

最早的零拷贝定义，来源于

*Linux 2.4内核新增 sendfile 系统调用，提供了零拷贝。磁盘数据通过 DMA 拷贝到内核态 Buffer 后，直接通过 DMA 拷贝到 NIO Buffer(socket buffer)，无需 CPU 拷贝。这也是零拷贝这一说法的来源。这是真正操作系统 意义上的零拷贝(也就是狭义零拷贝)。*

随着发展，零拷贝的概念得到了延伸，就是目前的减少不必要的数据拷贝都算作零拷贝的范畴。

### **Java生态圈中的零拷贝**

Linux提供的零拷贝技术 Java并不是全支持，支持2种(内存映射mmap、sendfile)；

#### **NIO提供的内存映射 MappedByteBuffer**

NIO中的FileChannel.map()方法其实就是采用了操作系统中的内存映射方式，底层就是调用Linux mmap()实现的。

将内核缓冲区的内存和用户缓冲区的内存做了一个地址映射。这种方式适合读取大文件，同时也能对文件内容进行更改，但是如果其后要通过SocketChannel发送，还是需要CPU进行数据的拷贝。

#### **NIO提供的sendfile**

Java NIO 中提供的 FileChannel 拥有 transferTo 和 transferFrom 两个方法，可直接把 FileChannel 中的数据拷贝到另外一个 Channel，或者直接把另外一个 Channel 中的数据拷贝到 FileChannel。该接口常被用于高效的网络 / 文件的数据传输和大文件拷贝。在操作系统支持的情况下，通过该方法传输数据并不需要将源数据从内核态拷贝到用户态，再从用户态拷贝到目标通道的内核态，同时也避免了两次用户态和内核态间的上下文切换，也即使用了“零拷贝”，所以其性能一般高于 Java IO 中提供的方法。

#### **Kafka中的零拷贝**

Kafka两个重要过程都使用了零拷贝技术，且都是操作系统层面的狭义零拷贝，一是Producer生产的数据存到broker，二是 Consumer从broker读取数据。

Producer生产的数据持久化到broker，broker里采用mmap文件映射，实现顺序的快速写入；

Customer从broker读取数据，broker里采用sendfile，将磁盘文件读到OS内核缓冲区后，直接转到socket buffer进行网络发送。

#### **Netty的零拷贝实现**

Netty 的零拷贝主要包含三个方面：

在网络通信上，Netty 的接收和发送 ByteBuffer 采用 DIRECT BUFFERS，使用堆外直接内存进行 Socket 读写，不需要进行字节缓冲区的二次拷贝。如果使用传统的堆内存（HEAP BUFFERS）进行 Socket 读写，JVM 会将堆内存 Buffer 拷贝一份到直接内存中，然后才写入 Socket 中。相比于堆外直接内存，消息在发送过程中多了一次缓冲区的内存拷贝。

在缓存操作上，Netty提供了CompositeByteBuf类，它可以将多个ByteBuf合并为一个逻辑上的ByteBuf，避免了各个ByteBuf之间的拷贝。

通过wrap操作，我们可以将byte[]数组、ByteBuf、 ByteBuffer 等包装成一个 Netty ByteBuf对象，进而避免了拷贝操作。

ByteBuf支持slice 操作，因此可以将ByteBuf分解为多个共享同一个存储区域的ByteBuf，避免了内存的拷贝。

在文件传输上，Netty 的通过FileRegion包装的FileChannel.tranferTo实现文件传输，它可以直接将文件缓冲区的数据发送到目标 Channel，避免了传统通过循环 write 方式导致的内存拷贝问题。
