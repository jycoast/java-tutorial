export default {
  '/docs/basic/': getBasicSiderBar(),
  '/docs/concurrent/': getConcurrentSiderBar(),
  '/docs/source-code/': getSourceCodeSiderBar(),
  '/docs/distributed/': getDistributedSiderBar(),
  '/docs/database/': getDataBaseSiderBar(),
  '/docs/mq/': getMqSiderBar(),
  '/docs/microservices/': getMicroservicesSiderBar()
}

function getBasicSiderBar() {
  return [
    {
      text: 'JVM',
      collapsed: false,
      items: [
        {
          text: "JVM类加载机制详解",
          link: "/docs/basic/jvm/classloader.md"
        },
        {
          text: "JVM内存模型深度剖析与优化",
          link: "/docs/basic/jvm/jmm.md"
        },
        {
          text: "深入理解Class文件",
          link: "/docs/basic/jvm/class.md"
        },
        {
          text: "JVM对象创建与内存分配机制深度剖析",
          link: "/docs/basic/jvm/object.md"
        },
        {
          text: "垃圾收集器ParNew&CMS与底层三色标记算法详解",
          link: "/docs/basic/jvm/garbage-collection.md"
        },
        {
          text: "垃圾收集器G1&ZGC详解",
          link: "/docs/basic/jvm/g1-zgc.md"
        },
        {
          text: "JVM调优工具详解及调优实战",
          link: "/docs/basic/jvm/optimization.md"
        },
        {
          text: "JVM调优实战及常量池详解",
          link: "/docs/basic/jvm/constant-pool.md"
        },
        {
          text: "为Java开疆拓土的ZGC深度剖析",
          link: "/docs/basic/jvm/zgc.md"
        },
        {
          text: "让Java性能提升的JIT深度剖析",
          link: "/docs/basic/jvm/jit.md"
        },
        {
          text: "GraalVM云原生时代的Java虚拟机",
          link: "/docs/basic/jvm/graalvm.md"
        }
      ],
    },
    {
      text: 'Tomcat',
      collapsed: false,
      items: [
        {
          text: "Tomcat整体架构",
          link: "/docs/basic/tomcat/overview.md"
        },
        {
          text: "Tomcat线程模型",
          link: "/docs/basic/tomcat/thread-model.md"
        },
        {
          text: "Tomcat类加载机制",
          link: "/docs/basic/tomcat/classloader.md"
        }
      ],
      
    },
    {
      text: 'Netty',
      collapsed: false,
      items: [
        {
          text: "深入理解网络通信和TCP、IP协议",
          link: "/docs/basic/netty/network.md"
        },
        {
          text: "BIO实战、NIO编程与直接内存、零拷贝深入辨析",
          link: "/docs/basic/netty/io.md"
        },
        {
          text: "深入Linux内核理解epoll",
          link: "/docs/basic/netty/epoll.md"
        },
        {
          text: "Netty使用和常用组件辨析",
          link: "/docs/basic/netty/component.md"
        },
        {
          text: "Netty实战-手写通信框架与面试难题分析",
          link: "/docs/basic/netty/interview.md"
        },
        {
          text: "Netty核心线程模型源码分析",
          link: "/docs/basic/netty/io-source.md"
        },
        // {
        //   text: "Netty底层数据通信源码剖析",
        //   link: "/docs/basic/netty/data-source.md"
        // }
      ],
    }
  ]
}

function getConcurrentSiderBar() {
  return [
    {
      text: 'Java 并发编程',
      items: [
        {
          text: "并发、线程与等待通知机制",
          link: "/docs/concurrent/1.md"
        },
        {
          text: "ThreadLocal详解",
          link: "/docs/concurrent/2.md"
        },
        {
          text: "CAS&Atomic 原子操作详解",
          link: "/docs/concurrent/3.md"
        },
        {
          text: "并发安全问题",
          link: "/docs/concurrent/4.md"
        },
        {
          text: "并发工具类应用场景",
          link: "/docs/concurrent/5.md"
        },
        {
          text: "AQS原理分析",
          link: "/docs/concurrent/6.md"
        },
        {
          text: "JUC包下的并发容器",
          link: "/docs/concurrent/7.md"
        },
        {
          text: "阻塞队列介绍",
          link: "/docs/concurrent/8.md"
        },
        {
          text: "线程池",
          link: "/docs/concurrent/9.md"
        },
        {
          text: "Fork/Join框架介绍",
          link: "/docs/concurrent/10.md"
        },
        {
          text: "Java内存模型详解",
          link: "/docs/concurrent/11.md"
        },
        {
          text: "CPU缓存架构详解",
          link: "/docs/concurrent/12.md"
        },
        {
          text: "高性能内存队列Disruptor详解",
          link: "/docs/concurrent/13.md"
        },
        {
          text: "常用并发设计模式",
          link: "/docs/concurrent/14.md"
        }
      ],
    }
  ]
}

function getSourceCodeSiderBar() {
  return [
    {
      text: 'Spring 源码解析',
      collapsed: false,
      items: [
        {
          text: "Spring概览",
          link: "/docs/source-code/spring/"
        },
        {
          text: "Spring核心对象",
          link: "/docs/source-code/spring/"
        },
        {
          text: "Bean的生成过程",
          link: "/docs/source-code/spring/"
        },
        {
          text: "Bean的销毁过程",
          link: "/docs/source-code/spring/"
        },
        {
          text: "Spring中到底有几种依赖注入的方式?",
          link: "/docs/source-code/spring/"
        },
        {
          text: "什么是循环依赖?",
          link: "/docs/source-code/spring/"
        },
        {
          text: "推断构造方法",
          link: "/docs/source-code/spring/"
        },
        {
          text: "Spring启动流程",
          link: "/docs/source-code/spring/"
        },
        {
          text: "Spring整合Mybatis",
          link: "/docs/source-code/spring/"
        },
        {
          text: "Spring Aop实现原理",
          link: "/docs/source-code/spring/"
        },
        {
          text: "Spring事务",
          link: "/docs/source-code/spring/"
        },
        {
          text: "SpringBoot 3.0",
          link: "/docs/source-code/spring/"
        },
      ]
    },
    {
      text: 'Spring MVC 源码解析',
      collapsed: false,
      items: [
        {
          text: "什么是Handler",
          link: "/docs/source-code/spring-mvc/"
        },
        {
          text: "什么是HandlerMapping",
          link: "/docs/source-code/spring-mvc/"
        },
        {
          text: "什么是HandlerAdapter",
          link: "/docs/source-code/spring-mvc/"
        },
        {
          text: "@RequestMapping方法参数解析",
          link: "/docs/source-code/spring-mvc/"
        },
        {
          text: "@RequestMapping方法返回值解析",
          link: "/docs/source-code/spring-mvc/"
        },
        {
          text: "SpringMVC父子容器",
          link: "/docs/source-code/spring-mvc/"
        },
        {
          text: "SpringMVC初始化",
          link: "/docs/source-code/spring-mvc/"
        },
        {
          text: "WebApplicationInitializer",
          link: "/docs/source-code/spring-mvc/"
        },
        {
          text: "方法参数解析",
          link: "/docs/source-code/spring-mvc/"
        },
        {
          text: "MultipartFile解析",
          link: "/docs/source-code/spring-mvc/"
        },
        {
          text: "拦截器解析",
          link: "/docs/source-code/spring-mvc/"
        },
        {
          text: "@EnableWebMvc解析",
          link: "/docs/source-code/spring-mvc/"
        },
      ]
    },
    {
      text: 'Mybatis 源码解析',
      collapsed: false,
      items: [
        {
          text: "Mybatis 介绍",
          link: "/docs/source-code/mybatis/"
        },
        {
          text: "传统JDBC和Mybatis对比",
          link: "/docs/source-code/mybatis/"
        },
        {
          text: "Mybatis概览",
          link: "/docs/source-code/mybatis/"
        },
        {
          text: "Mybatis 介绍",
          link: "/docs/source-code/mybatis/"
        },
        {
          text: "openSession的过程",
          link: "/docs/source-code/mybatis/"
        },
        {
          text: "Mapper方法的执行流程",
          link: "/docs/source-code/mybatis/"
        },
        {
          text: "Mybatis重要类",
          link: "/docs/source-code/mybatis/"
        },
      ]
    },
    {
      text: 'SpringBoot 源码解析',
      collapsed: false,
      items: [
        {
          text: "spring",
          link: "/docs/microservices/spring-boot/"
        },
      ]
    },
  ]
}

function getDistributedSiderBar() {
  return [
    {
      text: 'Zookeeper',
      items: [
        {
          text: " Zookeeper特性与节点数据类型",
          link: "/docs/distributed/zk"
        },
        {
          text: " Zookeeper Java客户端实战",
          link: "/docs/distributed/zk"
        },
        {
          text: " Zookeeper经典应用场景",
          link: "/docs/distributed/zk"
        },
        {
          text: " Zookeeper源码分析",
          link: "/docs/distributed/zk"
        },
        {
          text: "Zookeeper ZAB协议分析",
          link: "/docs/distributed/zk"
        },
      ]
    },
    {
      text: 'Sharding Sphere',
      items: [
        {
          text: "分库分表入门",
          link: "/docs/distributed/sharding-sphere"
        },
        {
          text: "ShardingJDBC分库分表实战指南",
          link: "/docs/distributed/sharding-sphere"
        },
        {
          text: "ShardingJDBC源码与内核解析",
          link: "/docs/distributed/sharding-sphere"
        },
        {
          text: "深入理解ShardingProxy服务端数据分片",
          link: "/docs/distributed/sharding-sphere"
        },
        {
          text: "CosID分布式主键生成框架",
          link: "/docs/distributed/sharding-sphere"
        },
      ]
    }
  ]
}

function getDataBaseSiderBar() {
  return [
    {
      text: 'MySQL',
      collapsed: false,
      items: [
        {
          text: "Explain详解与索引优化最佳实践",
          link: "/docs/database/mysql/"
        },
        {
          text: "Mysql索引优化实战",
          link: "/docs/database/mysql/"
        },
        {
          text: "Mysql事务原理与优化最佳实践",
          link: "/docs/database/mysql/"
        },
        {
          text: "Mysql索引优化实战二",
          link: "/docs/database/mysql/"
        },
        {
          text: "Mysql锁机制与优化实践以及MVCC底层原理剖析",
          link: "/docs/database/mysql/"
        },
        {
          text: "Innodb底层原理与Mysql日志机制深入剖析",
          link: "/docs/database/mysql/"
        },
        {
          text: "Mysql全局优化与Mysql 8.0新特性详解",
          link: "/docs/database/mysql/"
        },
        // {
        //   text: "MySQL中的锁",
        //   link: "/docs/database/mysql/"
        // },
      ]
    },
    {
      text: 'Redis',
      collapsed: false,
      items: [
        {
          text: "Redis核心数据结构与高性能原理",
          link: "/docs/database/redis"
        },
        {
          text: "Redis持久化、主从与哨兵架构详解",
          link: "/docs/database/redis"
        },
        {
          text: "Redis核心数据结构与高性能原理",
          link: "/docs/database/redis"
        },
        {
          text: "Redis高可用集群之水平扩展",
          link: "/docs/database/redis"
        },
      ]
    },
    {
      text: 'ElaticSearch',
      collapsed: false,
      items: [
        {
          text: "ElasticSearch快速入门实战",
          link: "/docs/database/es/quickstart-guide.md"
        },
        {
          text: "ElasticSearch高级查询语法Query DSL实战",
          link: "/docs/database/es/query-dsl.md"
        },
        {
          text: "ElasticSearch搜索技术深入与聚合查询实战",
          link: "/docs/database/es/analyze-aggregation.md"
        },
        {
          text: "ElasticSearch集群架构实战及其原理剖析",
          link: "/docs/database/es/cluster-architecture.md"
        },
        {
          text: "ElasticSearch高级功能详解与原理剖析",
          link: "/docs/database/es/advanced-features.md"
        },
        {
          text: "Logstash与FileBeat详解以及ELK整合详解",
          link: "/docs/database/es/logstash-fileBeat.md"
        },
      ]
    },
    {
      text: 'Mongodb',
      collapsed: false,
      items: [
        {
          text: "MongoDB快速实战与基本原理",
          link: "/docs/database/mongodb/"
        },
        {
          text: "MongoDB聚合操作与索引使用详解",
          link: "/docs/database/mongodb/"
        },
        {
          text: "MongoDB复制集实战及其原理分析",
          link: "/docs/database/mongodb/"
        },
        {
          text: "MongoDB分片集群&高级集群架构详解",
          link: "/docs/database/mongodb/"
        },
        {
          text: "MongoDB存储原理&多文档事务详解",
          link: "/docs/database/mongodb/"
        },
        {
          text: "MongoDB建模调优&change stream实战",
          link: "/docs/database/mongodb/"
        }
      ]
    },
  ]
}

function getMqSiderBar() {
  return [
    {
      text: 'Kafka',
      collapsed: false,
      items: [
        {
          text: "Kafka快速实战以及基本原理详解",
          link: "/docs/mq/Kafka/overview.md"
        },
        {
          text: "Kafka收发消息核心参数详解",
          link: "/docs/mq/Kafka/send-receiving-messages.md"
        },
        {
          text: "Kafka集群架构设计原理详解",
          link: "/docs/mq/Kafka/cluster-architecture.md"
        },
        {
          text: "Kafka日志索引详解以及生产常见问题分析与总结",
          link: "/docs/mq/Kafka/log.md"
        },
      ]
    },
    {
      text: 'RocketMQ',
      collapsed: false,
      items: [
        {
          text: "RocketMQ快速实战以及集群架构原理详解",
          link: "/docs/mq/rocketmq/overview.md"
        },
        {
          text: "RocketMQ 核心编程模型以及生产环境最佳实践",
          link: "/docs/mq/rocketmq/programming-model.md"
        },
        {
          text: "RocketMQ高性能核心原理与源码架构剖析",
          link: "/docs/mq/rocketmq/source-code.md"
        },
        {
          text: "RocketMQ生产环境常见问题分析与总结",
          link: "/docs/mq/rocketmq/prod.md"
        },
      ]
    },
    {
      text: 'RabbitMQ',
      collapsed: false,
      items: [
        {
          text: "RabbitMQ快速实战以及核心概念详解",
          link: "/docs/mq/rabbitmq/overview.md"
        },
        {
          text: "RabbitMQ核心编程模型以及消息应用场景详解",
          link: "/docs/mq/rabbitmq/programming-model.md"
        },
        {
          text: "RabbitMQ高级功能详解以及常用插件实战",
          link: "/docs/mq/rabbitmq/source-code.md"
        },
        {
          text: "RabbitMQ高可用集群架构详解以及生产环境最佳实践",
          link: "/docs/mq/rabbitmq/prod.md"
        },
      ]
    },
  ]
}

function getMicroservicesSiderBar() {
  return [
    {
      text: '微服务架构',
      collapsed: false,
      items: [
        {
          text: "微服务架构的演变",
          link: "/docs/microservices/orverview/orverview.md"
        },
        {
          text: "微服务架构的技术选型",
          link: "/docs/microservices/orverview/technology-selection.md"
        },
      ]
    },
    {
      text: 'Nacos',
      collapsed: false,
      items: [
        {
          text: "Nacos概览",
          link: "/docs/microservices/nacos/overview.md"
        },
        {
          text: "整合Nacos",
          link: "/docs/microservices/nacos/integration.md"
        },
        {
          text: "Nacos源码分析",
          link: "/docs/microservices/nacos/source-code.md"
        }
      ]
    },
    {
      text: 'Open Feign',
      collapsed: false,
      items: [
        {
          text: "Feign入门与实战",
          link: "/docs/microservices/open-feign/overview.md"
        },
        // {
        //   text: "Feign设计架构",
        //   link: "/docs/microservices/open-feign/architecture-design.md"
        // },
      ]
    },
    {
      text: 'Sentinel',
      collapsed: false,
      items: [
        {
          text: "Sentinel快速开始",
          link: "/docs/microservices/sentinel/"
        },
        {
          text: "整合Sentinel",
          link: "/docs/microservices/sentinel/"
        },
        {
          text: "Sentinel源码解析",
          link: "/docs/microservices/sentinel/"
        },
      ]
    },
    {
      text: '分布式事务',
      collapsed: false,
      items: [
        {
          text: "分布式事务与两阶段提交",
          link: "/docs/microservices/transactional/twophase-commit.md"
        },
        {
          text: "Seata概览",
          link: "/docs/microservices/transactional/overview.md"
        },
        {
          text: "Seata AT、XA、TCC模式",
          link: "/docs/microservices/transactional/detail.md"
        },
        {
          text: "Seata源码分析",
          link: "/docs/microservices/transactional/source-code.md"
        },
      ]
    },
    {
      text: 'Spring Cloud Gateway',
      collapsed: false,
      items: [
        {
          text: "Spring Cloud Gateway入门与实战",
          link: "/docs/microservices/gateway/overview.md"
        },
      ]
    },
    {
      text: 'Skywalking',
      collapsed: false,
      items: [
        {
          text: "Skywalking概览",
          link: "/docs/microservices/skywalking/orverview.md"
        },
        {
          text: "Skywalking使用",
          link: "/docs/microservices/skywalking/"
        },
        {
          text: "Skywalking集群部署",
          link: "/docs/microservices/skywalking/"
        },
      ]
    },
    {
      text: '分布式鉴权',
      collapsed: false,
      items: [
        {
          text: "Spring Security 实战",
          link: "/docs/microservices/auth/spring-security.md"
        },
        {
          text: "OAuth 2.0协议",
          link: "/docs/microservices/auth/oauth.md"
        },
        {
          text: "微服务网关整合OAuth 2.0",
          link: "/docs/microservices/auth/gateway-oauth.md"
        },
      ]
    },
  ]
}