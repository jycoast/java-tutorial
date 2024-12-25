# 环境准备

## **一:源代码**

```java
package com.tuling.smlz.jvm.classbyatecode;

/**
 * Created by smlz on 2019/11/5.
 */
public class TulingByteCode {

    private String userName;

    public String getUserName() {
        return userName;
    }

    public void setUserName(String userName) {
        this.userName = userName;
    }
}
```

## **二:反编译**

通过javap -verbose TulingByteCode .class`反编译

```java
//表示我们通过反编译的来源是哪个字节码文件
Classfile /D:/work_space/idea_space/spring-cloud-source/tuling-jvm/target/classes/com/tuling/smlz/jvm/classbyatecode/TulingByteCode.class
  //最后修改日期；文件大小
  Last modified 2019-11-5; size 629 bytes
  //文件的md5值
  MD5 checksum a0a9c001787f00738627278b0946a388
  //.class文件是通过哪个源文件编译过来的
  Compiled from "TulingByteCode.java"
  //字节码的详细信息
public class com.tuling.smlz.jvm.classbyatecode.TulingByteCode
  //jdk的次版本号
  minor version: 0
  //jdk的主版本号
  major version: 52
  //访问权限
  flags: ACC_PUBLIC, ACC_SUPER
  //常量池
Constant pool:
   #1 = Methodref          #4.#21         // java/lang/Object."<init>":()V
   #2 = Fieldref           #3.#22         // com/tuling/smlz/jvm/classbyatecode/TulingByteCode.userName:Ljava/lang/String;
   #3 = Class              #23            // com/tuling/smlz/jvm/classbyatecode/TulingByteCode
   #4 = Class              #24            // java/lang/Object
   #5 = Utf8               userName
   #6 = Utf8               Ljava/lang/String;
   #7 = Utf8               <init>
   #8 = Utf8               ()V
   #9 = Utf8               Code
  #10 = Utf8               LineNumberTable
  #11 = Utf8               LocalVariableTable
  #12 = Utf8               this
  #13 = Utf8               Lcom/tuling/smlz/jvm/classbyatecode/TulingByteCode;
  #14 = Utf8               getUserName
  #15 = Utf8               ()Ljava/lang/String;
  #16 = Utf8               setUserName
  #17 = Utf8               (Ljava/lang/String;)V
  #18 = Utf8               MethodParameters
  #19 = Utf8               SourceFile
  #20 = Utf8               TulingByteCode.java
  #21 = NameAndType        #7:#8          // "<init>":()V
  #22 = NameAndType        #5:#6          // userName:Ljava/lang/String;
  #23 = Utf8               com/tuling/smlz/jvm/classbyatecode/TulingByteCode
  #24 = Utf8               java/lang/Object
{ 
  //构造方法
  public com.tuling.smlz.jvm.classbyatecode.TulingByteCode();
    descriptor: ()V
    flags: ACC_PUBLIC
    Code:
      stack=1, locals=1, args_size=1
         0: aload_0
         1: invokespecial #1                  // Method java/lang/Object."<init>":()V
         4: return
      LineNumberTable:
        line 6: 0
      LocalVariableTable:
        Start  Length  Slot  Name   Signature
            0       5     0  this   Lcom/tuling/smlz/jvm/classbyatecode/TulingByteCode;
  //get方法
  public java.lang.String getUserName();
    descriptor: ()Ljava/lang/String;
    flags: ACC_PUBLIC
    Code:
      stack=1, locals=1, args_size=1
         0: aload_0
         1: getfield      #2                  // Field userName:Ljava/lang/String;
         4: areturn
      LineNumberTable:
        line 11: 0
      LocalVariableTable:
        Start  Length  Slot  Name   Signature
            0       5     0  this   Lcom/tuling/smlz/jvm/classbyatecode/TulingByteCode;
  //set方法
  public void setUserName(java.lang.String);
    descriptor: (Ljava/lang/String;)V
    flags: ACC_PUBLIC
    Code:
      stack=2, locals=2, args_size=2
         0: aload_0
         1: aload_1
         2: putfield      #2                  // Field userName:Ljava/lang/String;
         5: return
      LineNumberTable:
        line 15: 0
        line 16: 5
      LocalVariableTable:
        Start  Length  Slot  Name   Signature
            0       6     0  this   Lcom/tuling/smlz/jvm/classbyatecode/TulingByteCode;
            0       6     1 userName   Ljava/lang/String;
    MethodParameters:
      Name                           Flags
      userName
}
SourceFile: "TulingByteCode.java"

```

## **三:查看class文件**

**通过16进制查看器打开的文件结构是一个当个字节来显示，因为一个16进制数可以通过4位来表示,一个字节8位可以表示二个16进制数**

![image-20241224110207714](https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/202412241102801.png)

**我们class文件结构图**

​    ![image-20241224110214411](https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/202412241102477.png)

**Class文件结构参照表:**

![image-20241224110222117](https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/202412241102188.png)

**Class文件结构伪代码**

![image-20241224110229266](https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/202412241102358.png)

**3.1)我们通过javap -verbose来分析一个字节码的时候，将会分析字节码文件的魔数,主 次版本号,常量池，类信息，类的构造方法，类的中的方法信息，类变量与成员变量等信息.**

**魔数:** **文件的开头的 四个字节 是固定 值位**   **0xCAFEBABE**

![image-20241224110250724](https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/202412241102795.png)

**3.2)次版本号(**minor version**)****:二个字节00 00 表示jdk的次版本号**

![image-20241224110258256](https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/202412241102329.png)

**3.3)主版本号(****major version****)****:二个字节 00 34  表示为jdk的主版本号，34对于10进制为52**

**那么52代表的是1.8，51代表的是1.7 等等一直类推下去**

 ![image-20241224110311600](https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/202412241103672.png)

**所以通过主次版本号来确定我们jdk的版本是1.8.0**

![image-20241224110319180](https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/202412241103243.png)

**3.4)常量池入口****，占用二个字节,表示常量池中的个数=00 19 (25)-1=****24****个, 为啥需要-1，因为常量池中的第0个位置被我们的jvm占用了表示为null  所以我们通过编译出来的常量池索引是从1开始的.**

```java
Constant pool:
   #1 = Methodref          #4.#21         // java/lang/Object."<init>":()V
   #2 = Fieldref           #3.#22         // com/tuling/smlz/jvm/classbyatecode/TulingByteCode.userName:Ljava/lang/String;
   #3 = Class              #23            // com/tuling/smlz/jvm/classbyatecode/TulingByteCode
   #4 = Class              #24            // java/lang/Object
   #5 = Utf8               userName
   #6 = Utf8               Ljava/lang/String;
   #7 = Utf8               <init>
   #8 = Utf8               ()V
   #9 = Utf8               Code
  #10 = Utf8               LineNumberTable
  #11 = Utf8               LocalVariableTable
  #12 = Utf8               this
  #13 = Utf8               Lcom/tuling/smlz/jvm/classbyatecode/TulingByteCode;
  #14 = Utf8               getUserName
  #15 = Utf8               ()Ljava/lang/String;
  #16 = Utf8               setUserName
  #17 = Utf8               (Ljava/lang/String;)V
  #18 = Utf8               MethodParameters
  #19 = Utf8               SourceFile
  #20 = Utf8               TulingByteCode.java
  #21 = NameAndType        #7:#8          // "<init>":()V
  #22 = NameAndType        #5:#6          // userName:Ljava/lang/String;
  #23 = Utf8               com/tuling/smlz/jvm/classbyatecode/TulingByteCode
  #24 = Utf8               java/lang/Object
```

**3.4.1）常量池结构表如图所示**

**u1,u2,u4,u8分别代表1个字节,2个字节,4个字节,8个字节的无符号数**

![image-20241224110345859](https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/202412241103972.png)

![image-20241224110400441](https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/202412241104548.png)

**3.4.2)****我们的常量池可以看作我们的java class类的一个资源仓库(比如Java类定的方法和变量信息),我们后面的方法 类的信息的描述信息都是通过索引去常量池中获取。**

**1)常量池中主要存放二种常量,一种是字面量  一种是符号引用**

![image-20241224111036692](https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/202412241110761.png)

![image-20241224111046810](https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/202412241110900.png)

**3.4.3)在JVM规范中，每个字段或者变量都有描述信息,描述信息的主要作用是 数据类型，方法参数列表,返回值类型等.** 

**1)基本参数类型和void类型都是用一个大写的字符来表示，对象类型是通过一个大写L加全类名表示，这么做的好处就是在保证jvm能读懂class文件的情况下尽量的压缩class文件体积.**

**基本数据类型表示:**

```shell
B ----> byte
C ----> char
D ----> double
F -----> float
I ------> int
J ------> long
S ------> short
Z ------> boolean
V -------> void
```

**对象类型:**

```shell
String ------> Ljava/lang/String;(后面有一个分号)
```

**对于数组类型: 每一个唯独都是用一个前置 [ 来表示**

**比如:** 

```shell
int[] ------> [ I,

String [][] ------> [[Ljava.lang.String;
```

**2）用描述符来描述方法的,先参数列表，后返回值的格式，参数列表按照严格的顺序放在()中**

**比如源码`String getUserInfoByIdAndName(int id, String name)` 的方法描述符号**

```
（I,Ljava/lang/String;）Ljava/lang/String;
```

# 常量池分析

**第1个常量池分析:**  **0A 00 04 00 15** 

**0A:表示是常量池中的常量类型为方法引用**

![image-20241224111318036](https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/202412241113098.png)

**00 04二个字节表示的是是方法所在类   指向常量池的索引位置为#4,然后我们发现**

**#4的常量类型是Class，也是符号引用类型，指向常量池#24的位置,而#24是的常量池类型是字面量值为:java/lang/Object**

**00 15二个字节表示是方法的描述符，指向常量池索引#21的位置,我们发现#21的常量类型是"NameAndType类型"属于引用类型，指向常量池的#7  #8位置**

**#7常量类型是UTF-8类型属于字面量值为: 为构造方法**

**#8常量也是UTF-8类型的字面量值为:()V**

**所以常量池中的第一个常量是：java/lang/Object."":()V**

**画图分析:**

![image-20241225100942012](https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/202412251009715.png)

![image-20241225100951231](https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/202412251009330.png)

**第二个常量分析：09 00 03 00 16** 

**09表示的是我们的** **CONSTANT_Methodref_info 字段类型的常量**

![image-20241225101028790](https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/202412251010977.png)

**00 03表示的class_index 表示是常量池中第三个 为我们的class常量的索引位置**

**00 16:表示该字段的名称和类型 指向我们常量池中索引为22的位置**

**解释:03表示指向常量池第三个位置,我们发现第三个位子是Class类型的常量，03位置的常量池应用指向的是#23的位置，而我们的#23常量池类型是utf-8表示是字面量**

**值为:com/tuling/smlz/jvm/classbyatecode/TulingByteCode**

**#22为常量池类型的nameAndType类型，分别指向我们的常量池第#5(utf-8类型的常量)的位置表示我们的字段的名称userName，#6指向的是常量池第六个位置,类型是utf-8类型的值为:Ljava/lang/String;**

**第二个常量com/tuling/smlz/jvm/classbyatecode/TulingByteCode.userName:Ljava/lang/String;**

**画图分析:**

![image-20241225101138150](https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/202412251011299.png)

![image-20241225101146311](https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/202412251011412.png)

**第三个常量分析: 07 00 17** 

![image-20241225101159092](https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/202412251011167.png)

**第一个字节:07表示的是   class_info符号引用类型的常量**

**第二三个字节: 00 17表示是指向常量池中索引为23的位置,#23的常量池类型是utf8字面量**

**那么****utf8_info****的结构如下:**

![image-20241225101212633](https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/202412251012701.png)

第#23的常量的结构是

**其中 01表示utf8_info的常量类型**

**00 31：表示后面跟着49个字节是字面量的值**

01 00 31 63 6F 6D 2F 74 75  6C 69 6E 67 2F 73 6D 6C

7A 2F 6A 76 6D 2F 63 6C  61 73 73 62 79 61 74 65

63 6F 64 65 2F 54 75 6C  69 6E 67 42 79 74 65 43

6F 64 65 

![image-20241225101224776](https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/202412251012844.png)

![image-20241225101238821](https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/202412251012921.png)

![image-20241225101250765](https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/202412251012867.png)

**第四个常量分析:  07 00 18**

![image-20241225101303107](https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/202412251013186.png)

**第一个字节:07表示的是   class_info符号引用类型的常量**

**第二三个字节: 00 18表示是指向常量池中索引为24的位置,#24的常量池类型是utf8字面量**

**那么****utf8_info****的结构如下:**

![image-20241225101310898](https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/202412251013971.png)

**01 00 10 6A 61  76 61 2F 6C 61 6E 67 2F 4F 62 6A 65 63 74**

 **其中 01表示utf8_info的常量类型**

 **00 10：表示后面跟着16个字节是字面量的值**

**6A 61  76 61 2F 6C 61 6E 67 2F 4F 62 6A 65 63 74 字面量的值为:****java/lang/Object**

![image-20241225101323228](https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/202412251013337.png)

 ![image-20241225101343262](https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/202412251013383.png)

**第五个常量:  01 00 08 75 73 65  72 4E 61 6D 65** 

![image-20241225105815051](https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/202412251058145.png)

**01：tag位表示的是utf8类型的字面量常量**

**00 08二个字节表示的是字面量常量的长度为8   、**

**75 73 65  72 4E 61 6D 65  转为字符串为userName**

![image-20241225105822970](https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/202412251058020.png)

![image-20241225105830309](https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/202412251058363.png)

![image-20241225105840470](https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/202412251058561.png)

**第六个常量分析:** 

**01 00 12  4C 6A 61 76 61 2F 6C 61 6E 67 2F 53 74 72 69 6E  67  3B**

![image-20241225105851952](https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/202412251058004.png)

**01：tag位表示的是utf8类型的字面量常量**

**00 12二个字节表示的是字面量常量的长度为18  、**

**4C 6A 61 76 61 2F 6C 61 6E 67 2F 53 74 72 69 6E  67  3B  转为字符串为  Ljava/lang/String;**

![image-20241225105906543](https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/202412251059603.png)

![image-20241225105914191](https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/202412251059242.png)

![image-20241225105925543](https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/202412251059613.png)

**第七个常量分析:01 00 06 3C 69 6E 69 74 3E** 

![image-20241225105933305](https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/202412251059355.png)

**01：tag位表示的是utf8类型的字面量常量**

**00 06二个字节表示的是字面量常量的长度为6** 

 **3C 69 6E 69 74 3E**   **转为字符串为**  `<init>`

![image-20241225105947103](https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/202412251059158.png)

  ![image-20241225110007302](https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/202412251100353.png)

![image-20241225110017069](https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/202412251100143.png)

**第八个常量分析:01 00 03 28 29  56** 

![image-20241225110025560](https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/202412251100618.png)

**01：tag位表示的是utf8类型的字面量常量**

**00 03二个字节表示的是字面量常量的长度为3**

**28 29  56**    **转为字符串为  ()V**

![image-20241225105610288](https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/202412251056342.png)

![image-20241225105557273](https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/202412251055324.png)

![image-20241225105549263](https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/202412251055339.png)

**第九个常量分析:01 00 04 43 6F 64 65**

![image-20241225105542256](https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/202412251055311.png)

**01：tag位表示的是utf8类型的字面量常量**

**00 04二个字节表示的是字面量常量的长度为4**

**43 6F 64 65**  **转为字符串为 Code**

![image-20241225105534285](https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/202412251055337.png)

![image-20241225105526927](https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/202412251055980.png)

![image-20241225105519789](https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/202412251055876.png)

**第十个常量分析:01 00 0F 4C 69 6E 65 4E  75 6D 62 65 72 54 61 62 6C 65** 

![image-20241225105510934](https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/202412251055986.png)

**01：tag位表示的是utf8类型的字面量常量**

**00 0F二个字节表示的是字面量常量的长度为15**

**4C 69 6E 65 4E  75 6D 62 65 72 54 61 62 6C 65  转为字符串为 LineNumberTable**

**表示这个是行号表**

![image-20241225105500027](https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/202412251055083.png)

![image-20241225105445250](https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/202412251054305.png)

![image-20241225105437245](https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/202412251054319.png)

**第11个常量:01 00 12 4C 6F 63  61 6C 56 61 72 69 61 62 6C 65 54 61 62 6C 65** 

![image-20241225105426868](https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/202412251054920.png)

**01：tag位表示的是utf8类型的字面量常量**

**00 12二个字节表示的是字面量常量的长度为18**

**4C 6F 63  61 6C 56 61 72 69 61 62 6C 65 54 61 62 6C 65**   **转为字符串为LocalVariableTable**

**表示这个是本地变量表**

![image-20241225105418321](https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/202412251054369.png)

![image-20241225105410205](https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/202412251054265.png)

![image-20241225105402636](https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/202412251054711.png)

**第12个常量: 01  00 04 74 68 69 73** 

![image-20241225105354224](https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/202412251053290.png)

**01：tag位表示的是utf8类型的字面量常量**

**00 14二个字节表示的是字面量常量的长度为4**

**74 68 69 73**    **转为字符串为this**

![image-20241225105220458](https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/202412251052508.png)

![image-20241225105206397](https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/202412251052455.png)

![image-20241225105156787](https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/202412251051864.png)

**第13个常量:** 

**01 00 33 4C 63 6F 6D 2F 74 75  6C 69 6E 67 2F 73 6D 6C 7A 2F 6A 76 6D 2F 63 6C  61 73 73 62 79 61 74 65 63 6F 64 65 2F 54 75 6C  69 6E 67 42 79 74 65 43 6F 64 65 3B** 

![image-20241225105145863](https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/202412251051917.png)

**01：tag位表示的是utf8类型的字面量常量**

**00 33二个字节表示的是字面量常量的长度为51**

**4C 63 6F 6D 2F 74 75  6C 69 6E 67 2F 73 6D 6C 7A 2F 6A 76 6D 2F 63 6C  61 73 73 62 79 61 74 65 63 6F 64 65 2F 54 75 6C  69 6E 67 42 79 74 65 43 6F 64 65 3B** 

**表示字符串: Lcom/tuling/smlz/jvm/classbyatecode/TulingByteCode;**

![image-20241225105138162](https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/202412251051214.png)

![image-20241225105130613](https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/202412251051666.png)

![image-20241225105125240](https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/202412251051321.png)

**第14个常量:01 00 0B 67  65 74 55 73 65 72 4E 61 6D 65** 

**01：tag位表示的是utf8类型的字面量常量**

**00 0B 二个字节表示的是字面量常量的长度为11**

![image-20241225105116278](https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/202412251051332.png)

**67  65 74 55 73 65 72 4E 61 6D 65 表示的是字符串getUserName**

![image-20241225105106902](https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/202412251051954.png)

![image-20241225105059715](https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/202412251050772.png)

![image-20241225105043169](https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/202412251050242.png)

**第15个常量分析:01 00 14 28 29 4C  6A 61 76 61 2F 6C 61 6E 67 2F 53 74 72 69 6E 67  3B** 

 ![image-20241225105031900](https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/202412251050959.png)

**01：tag位表示的是utf8类型的字面量常量**

**00 14 二个字节表示的是字面量常量的长度为20**

**接下来20个字节:** **28 29 4C  6A 61 76 61 2F 6C 61 6E 67 2F 53 74 72 69 6E 67  3B  表示字符串**

**()Ljava/lang/String;**

![image-20241225105020546](https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/202412251050598.png)

![image-20241225105002402](https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/202412251050449.png)

![image-20241225104953616](https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/202412251049688.png)

**第16个常量池分析: 01 00 0B 73 65 74 55 73 65 72 4E 61 6D 65** 

![image-20241225104943391](https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/202412251049440.png)

**01：tag位表示的是utf8类型的字面量常量**

**00 0B 二个字节表示的是字面量常量的长度为11**

**接下来11个字节:** **73 65 74 55 73 65 72 4E 61 6D 65  表示字符串 setUserName**

![image-20241225104935617](https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/202412251049671.png)

![image-20241225104929630](https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/202412251049684.png)

![image-20241225104922626](https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/202412251049699.png)

**第17个常量池:01  00 15 28 4C 6A 61 76 61 2F 6C 61 6E 67 2F 53 74  72 69 6E 67 3B 29 56** 

![image-20241225104912564](https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/202412251049617.png)

**01：tag位表示的是utf8类型的字面量常量**

**00 15 二个字节表示的是字面量常量的长度为21**

**接下来21个字节:**  **28 4C 6A 61 76 61 2F 6C 61 6E 67 2F 53 74  72 69 6E 67 3B 29 56  表示字符串 (Ljava/lang/String;)V**

 ![image-20241225104904719](https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/202412251049775.png)

![image-20241225104857331](https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/202412251048382.png)

![image-20241225104849903](https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/202412251048975.png)

**第18个常量：01 00 10 4D 65 74 68 6F 64  50 61 72 61 6D 65 74 65 72 73** 

![image-20241225104840866](https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/202412251048920.png)

**01：tag位表示的是utf8类型的字面量常量**

**00 10 二个字节表示的是字面量常量的长度为16**

**接下来16个字节:**  **4D 65 74 68 6F 64  50 61 72 61 6D 65 74 65 72 73**   **表示字符串MethodParameters**

![image-20241225104832481](https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/202412251048530.png)

![image-20241225104812742](https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/202412251048793.png)

![image-20241225104803747](https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/202412251048825.png)

**第19个常量: 01 00 0A 53 6F 75  72 63 65 46 69 6C 65** 

![image-20241225104706373](https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/202412251047426.png)

**01：tag位表示的是utf8类型的字面量常量**

**00 0A 二个字节表示的是字面量常量的长度为10**

**接下来10个字节:**  **53 6F 75  72 63 65 46 69 6C 65**    **表示字符串SourceFile**

![image-20241225104607654](https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/202412251046705.png)

![image-20241225104558921](https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/202412251045988.png)

![image-20241225104548958](https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/202412251045033.png)

**第20个常量分析:01 00 13 54 75 6C 69 6E 67  42 79 74 65 43 6F 64 65 2E 6A 61 76 61** 

![image-20241225104537521](https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/202412251045587.png)

**01：tag位表示的是utf8类型的字面量常量**

**00 13 二个字节表示的是字面量常量的长度为19**

**接下来19个字节:** **54 75 6C 69 6E 67  42 79 74 65 43 6F 64 65 2E 6A 61 76 61**    **表示字符串TulingByteCode.java**

![image-20241225104529392](https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/202412251045456.png)

![image-20241225104520036](https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/202412251045096.png)

![image-20241225104512352](https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/202412251045423.png)

**21个常量池分析: 0C 00 07  00 08**  

![image-20241225104455220](https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/202412251044280.png)

**0C：tag位表示的是符号引用 nameAndType_info类型的**

**00 07 指向索引为7的常量池#7**

**00 08 指向常量池8的位置#8**

![image-20241225104445619](https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/202412251044699.png)

![image-20241225104439160](https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/202412251044213.png)

![image-20241225104430682](https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/202412251044761.png)

**第22个常量池:0C 00 05 00 06** 

![image-20241225104420557](https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/202412251044611.png)

**0C：tag位表示的是符号引用 nameAndType_info类型的**

**00 05 指向索引为7的常量池#5**

**00 06 指向常量池8的位置#6**

![image-20241225104411767](https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/202412251044837.png)

![image-20241225104403695](https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/202412251044746.png)

![image-20241225104355777](https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/202412251043849.png)

**第23个常量池:**

**01 00 31 63 6F 6D 2F 74 75  6C 69 6E 67 2F 73 6D 6C 7A 2F 6A 76 6D 2F 63 6C  61 73 73 62 79 61 74 65 63 6F 64 65 2F 54 75 6C  69 6E 67 42 79 74 65 43 6F 64 65** 

![image-20241225104344903](https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/202412251043973.png)

**01：tag位表示的是utf8类型的字面量常量**

**00 31 二个字节表示的是字面量常量的长度为49**

**接下来49个字节:** **63 6F 6D 2F 74 75  6C 69 6E 67 2F 73 6D 6C 7A 2F 6A 76 6D 2F 63 6C  61 73 73 62 79 61 74 65 63 6F 64 65 2F 54 75 6C  69 6E 67 42 79 74 65 43 6F 64 65**     **表示字符串com/tuling/smlz/jvm/classbyatecode/TulingByteCode**

![image-20241225104337406](https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/202412251043464.png)

 ![image-20241225104326106](https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/202412251043180.png)

![image-20241225104318851](https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/202412251043935.png)

**第24个常量池:01 00 10 6A 61  76 61 2F 6C 61 6E 67 2F 4F 62 6A 65 63 74** 

![image-20241225104309706](https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/202412251043763.png)

**01：tag位表示的是utf8类型的字面量常量**

**00 10 二个字节表示的是字面量常量的长度为16**

**接下来16个字节:**  **6A 61  76 61 2F 6C 61 6E 67 2F 4F 62 6A 65 63 74**      **表示字符串java/lang/Object**

![image-20241225104301875](https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/202412251043931.png)

![image-20241225104252559](https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/202412251042616.png)

![image-20241225104229710](https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/202412251042783.png)

**四:Class文件结构访问标识符号解析 Access_flag**

**解析我们的class文件是类还是接口，是否定义为public的,是否是abstract,是否被final修饰。**

 ![image-20241225104219721](https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/202412251042802.png)

**访问标志符号占用二个字节: 00 21**  

![image-20241225104207100](https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/202412251042155.png)

**我们发现这个class文件的访问标识字节是0x0021，我们去查询手册中查询没有这个对应的？**

**原因:jvm规范并没有穷举出所以的类型  而是通过位运算的出来的.**

**0x0021 =** **0x0020** **位运算**  **0x0001**  **那么我们可以得出这个class的访问权限是****ACC_PUBLIC** **和****ACC_SUPER**

![image-20241225104158104](https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/202412251041163.png)

**五: This class name的描述当前的所属类**

**this class name 占用二个字节:00 03 表示索引  指向的是常量池中的第三个常量**

![image-20241225104150990](https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/202412251041053.png)

**根据第三部分常量池分析得出第三个常量分析得出如下**

![image-20241225104143760](https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/202412251041839.png)

**所以我们的this class name：表示当前类** **com/tuling/smlz/jvm/classbyatecode/TulingByteCode**

**第六部分: super class name （当前class的父类名字）**

**同样占用二个字节:00 04  也是表示索引值，指向常量池中第四个常量**

![image-20241225104136188](https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/202412251041243.png)

**根据第三部分常量池的分析第四个常量池得出.**

![image-20241225104112830](https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/202412251041899.png)

**所以我们的super class name表示的意思是: java/lang/Object**

**第七部分:接口信息（\**标注 我们的当前class没有实现接口为了演示效果我用的另外一个类演示） 这个类我们实现了二个接口 分别为ITulingIntf   ITulingIntf**  

![image-20241225104047655](https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/202412251040718.png)

**00 02 00 08 00 09**  **这六个字节描述的信息是**

![image-20241225104029363](https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/202412251040429.png)

**00 02****表示我们实现了几个接口 这里很明星我们是实现了二个接口**

**00 08(第一个接口)** **表示的是接口的位于常量池中的索引.#8**

![image-20241225104021750](https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/202412251040810.png)

**所以00 08指向的接口是:com/tuling/smlz/jvm/classbyatecode/ITulingIntf**

**00 09（第二个接口）****表示的是接口的位于常量池中的索引#9**

![image-20241225104013402](https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/202412251040461.png)

**第八部分:字段表信息**

**作用:用于描述类和接口中声明的变量，包括类变量和实例变量**

**但是不包括方法的局部变量**

**仅仅的接着接口信息后面的是字段描述  00 01 00 02 00 05 00 06 00 00**  

**00 01 二个字节表示的是field_info字段表的个数   这里很显然只有一个**

![image-20241225103736246](https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/202412251037315.png)

**字段结构体**

![image-20241225103723099](https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/202412251037168.png)

**00 02 00 05 00 06 00 00**

**所以****00 02** **表示访问修饰符号为ACC_PRIVATE**

**所以****00 05** **表示的是字段的名称  指向的是常量池中第五个常量**

![image-20241225103716251](https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/202412251037307.png)

**所以****00 06****是我们的字段的描述符: 指向的是常量池中第六个常量**

![image-20241225103658314](https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/202412251036379.png)

**00 00** **表示是属性表的个数  这里为0表示后面是没有属性表集合**

**通过jclasslib分析和我们自己分析的出来的结论一致**

![image-20241225103648442](https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/202412251036511.png)

**第九部分:方法表信息分析**

![image-20241225103615536](https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/202412251036724.png)

**00 03 表示我们的方法的个数为三个**

![image-20241225103607019](https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/202412251036073.png)

**方法表结构:如下**![image-20241225103552917](https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/202412251035985.png)

**第一个方法的前八个字节** **00 01 00 07 00 08  00 01** 

![image-20241225103543983](https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/202412251035066.png)

**00 01:****表示的是方法的修饰符 表示的是acc_public**

![image-20241225103453565](https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/202412251034628.png)

**00 07****：表示的是方法的名称 表示指向常量池中第7个常量,表示方法的名称**

**`<init>`表示构造方法**

![image-20241225103421584](https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/202412251034650.png)

**00 08****：方法的描述符号,表示指向常量池第八个常量 为()V 表示的是无参无返回值**

![image-20241225103412805](https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/202412251034867.png)

**00 01****表示有一个方法属性的个数**

**9.1）方法表中的属性表attribute_info结构图**

![image-20241225103405130](https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/202412251034197.png)

![image-20241225103356833](https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/202412251033885.png)

**00 09 00 00 00 2F**

**00 09****：表示的是方法属性名称的索引指向常量池#9 表示是Code属性**

![image-20241225103348704](https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/202412251033766.png)

**00 00 00 2F**   **标识的info的长度 长度值为47个字节 也就是说 会占据47个字节作为code的值**

**后续的47个字节是我们的Code属性的所占用的字节 (****特别特别需要注意这47个字节从Code属性表中第三个开始也就是max_stack开始****)**

**code_attribute属性表结构如下**

 ![image-20241225103341104](https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/202412251033218.png)

![image-20241225103330272](https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/202412251033336.png)

**00 01 00 01 00 00 00 05 2A B7 00 01 B1 00 00 00  02 00 0A 00 00 00 06 00 01 00 00 00 06 00 0B 00  00 00 0C 00 01 00 00 00 05 00 0C 00 0D 00 00** 

**00 01** **00 01 00 00 00 05 2A B7 00 01 B1 00 00 00  02 00 0A 00 00 00 06 00 01 00 00 00 06 00 0B 00  00 00 0C 00 01 00 00 00 05 00 0C 00 0D 00 00** 

 **(max_stack)****表示的是我们最大操作数栈的深度为1**

 ![image-20241225103319313](https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/202412251033396.png)

**00 01** **00 01** **00 00 00 05 2A B7 00 01 B1 00 00 00  02 00 0A 00 00 00 06 00 01 00 00 00 06 00 0B 00  00 00 0C 00 01 00 00 00 05 00 0C 00 0D 00 00** 

**(max_locals)标识的是局部变量表变量的个数**

![image-20241225103310493](https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/202412251033572.png)

**00 01 00 01 00 00 00 05** **2A B7 00 01 B1** **00 00 00  02 00 0A 00 00 00 06 00 01 00 00 00 06 00 0B 00  00 00 0C 00 01 00 00 00 05 00 0C 00 0D 00 00** 

**(Code_lenth)四个字节表示的是我们指令的长度为五**

**字节码指令助记符号     2A B7 00 01 B1** 

**0x2A:****对应的字节码注记符是aload_0,作用就是把当前调用方法的栈帧中的局部变量表索引位置为0的局部变量推送到操作数栈的栈顶.**

**0xB7****:表示是 invokespecial 调用父类的方法  那么后面需要接入二个字节表示调用哪个方法  所以** **00 01** **表示的是指向常量池中第一个位置为为如下结构**

![image-20241225103302036](https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/202412251033106.png)

![image-20241225103254462](https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/202412251032540.png)

**0xB1** **对应的字节码指令值retrun   表示retrun void from method；**

![image-20241225103246927](https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/202412251032999.png)

**异常信息表的个数为 00 00 表示方法没有抛出异常**

**00 01 00 01 00 00 00 05 2A B7 00 01 B1** **00 00** **00  02 00 0A 00 00 00 06 00 01 00 00 00 06 00 0B 00  00 00 0C 00 01 00 00 00 05 00 0C 00 0D 00 00** 

![image-20241225103239868](https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/202412251032941.png)

**表示Code_attribute结构中属性表的个数为00 02 表示为2个**

**00 01 00 01 00 00 00 05 2A B7 00 01 B1** **00 00** **00  02** **00 0A 00 00 00 06 00 01 00 00 00 06 00 0B 00  00 00 0C 00 01 00 00 00 05 00 0C 00 0D 00 00** 

![image-20241225103232605](https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/202412251032683.png)

**LineNumberTable结构体为下图**

![image-20241225103224553](https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/202412251032620.png)

**00 01 00 01 00 00 00 05 2A B7 00 01 B1** **00 00 00  02** **00 0A** **00 00 00 06 00 01 00 00 00 06 00 0B 00  00 00 0C 00 01 00 00 00 05 00 0C 00 0D 00 00** 

**这二个字节表示的是我们属性名称的索引****attribute_name_index****指向常量池中的00 0A #10个常量池**

 ![image-20241225103216016](https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/202412251032094.png)

**attribute_length****:属性的长度占用四个字节: 表示后面****00 00 00 06**   **六个字节是我们属性的内容**

**00 01 00 01 00 00 00 05 2A B7 00 01 B1** **00 00 00  02 00 0A** **00 00 00 06** **00 01 00 00 00 06 00 0B 00  00 00 0C 00 01 00 00 00 05 00 0C 00 0D 00 00** 

![image-20241225103018714](https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/202412251030796.png)

**这里的****00 01 表示的是有几对指令码和源码映射关系 这里明显只有一对**

**00 01 00 01 00 00 00 05 2A B7 00 01 B1** **00 00 00  02 00 0A 00 00 00 06** **00 01** **00 00 00 06 00 0B 00  00 00 0C 00 01 00 00 00 05 00 0C 00 0D 00 00** 

![image-20241225103011595](https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/202412251030668.png)

**00 01 00 01 00 00 00 05 2A B7 00 01 B1** **00 00 00  02 00 0A 00 00 00 06 00 01** **00 00 00 06** **00 0B 00  00 00 0C 00 01 00 00 00 05 00 0C 00 0D 00 00** 

**这里表示 第一个指令码映射的是第六行源码**

**LocalVariableTable 本地方法变量表结构分析**

![image-20241225102945658](https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/202412251029732.png)

**00 01 00 01 00 00 00 05 2A B7 00 01 B1** **00 00 00  02 00 0A 00 00 00 06 00 01 00 00 00 06** **00 0B** **00  00 00 0C 00 01 00 00 00 05 00 0C 00 0D 00 00** 

**本地变量表的名称的索引指向****attribute_name_index****的是常量池11的位置:**

![image-20241225102937935](https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/202412251029021.png)

**本地变量表中属性的长度attribute_length:12长度**

**00 01 00 01 00 00 00 05 2A B7 00 01 B1** **00 00 00  02 00 0A 00 00 00 06 00 01 00 00 00 06 00 0B** **00  00 00 0C** **00 01 00 00 00 05 00 0C 00 0D 00 00** 

**本地变量表local_variable_table_length的个数**

**00 01 00 01 00 00 00 05 2A B7 00 01 B1** **00 00 00  02 00 0A 00 00 00 06 00 01 00 00 00 06 00 0B 00  00 00 0C** **00 01** **00 00 00 05 00 0C 00 0D 00 00**

**local_vabiable_info的结构**

![image-20241225102440293](https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/202412251024364.png)

 **start_pc****:****这个局部变量的生命周期开始的字节码偏移量  占用二个字节**

**00 01 00 01 00 00 00 05 2A B7 00 01 B1** **00 00 00  02 00 0A 00 00 00 06 00 01 00 00 00 06 00 0B 00  00 00 0C 00 01** **00 00** **00 05 00 0C 00 0D 00 00**

 ![image-20241225102433138](https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/202412251024223.png)

**length****:****作用范围覆盖的长度  占用二个字节**

**00 01 00 01 00 00 00 05 2A B7 00 01 B1** **00 00 00  02 00 0A 00 00 00 06 00 01 00 00 00 06 00 0B 00  00 00 0C 00 01 00 00** **00 05** **00 0C 00 0D 00 00**

  ![image-20241225102426237](https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/202412251024316.png)

**name_index****:表示局部变量的名称 二个字节** 

**00 0C****表示指向常量池12的位置**

**00 01 00 01 00 00 00 05 2A B7 00 01 B1** **00 00 00  02 00 0A 00 00 00 06 00 01 00 00 00 06 00 0B 00  00 00 0C 00 01 00 00 00 05** **00 0C** **00 0D 00 00**

![image-20241225102350133](https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/202412251023198.png)

![image-20241225102336158](https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/202412251023264.png)

**desc_index****:表示局部变量描述符索引 二个字节** 

 **00 0D****表示指向常量池13的位置**

**00 01 00 01 00 00 00 05 2A B7 00 01 B1** **00 00 00  02 00 0A 00 00 00 06 00 01 00 00 00 06 00 0B 00  00 00 0C 00 01 00 00 00 05 00 0C** **00 0D** **00 00**

![image-20241225102325786](https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/202412251023856.png)

![image-20241225102319262](https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/202412251023346.png)

**index****:****index是这个局部变量在栈帧局部变量表中Slot的位置。当这个变量数据类型是64位类型时（double和long），它占用的Slot为index和index+1两个**

**00 01 00 01 00 00 00 05 2A B7 00 01 B1** **00 00 00  02 00 0A 00 00 00 06 00 01 00 00 00 06 00 0B 00  00 00 0C 00 01 00 00 00 05 00 0C 00 0D** **00 00**

![image-20241225102310540](https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/202412251023617.png)

**第二个方法的字节码** 

![image-20241225102303218](https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/202412251023300.png)

**00  01 00 0E 00 0F 00 01 00 09 00 00 00 2F 00 01 00  01 00 00 00 05 2A B4 00 02 B0 00 00 00 02 00 0A  00 00 00 06 00 01 00 00 00 0B 00 0B 00 00 00 0C  00 01 00 00 00 05 00 0C 00 0D 00 00** 

**1)方法访问标记符号:**

**0x0001****我们根据访问权限修饰符号查询可得 访问权限是****ACC_PUBLIC**

**00  01** **00 0E 00 0F 00 01 00 09 00 00 00 2F 00 01 00  01 00 00 00 05 2A B4 00 02 B0 00 00 00 02 00 0A  00 00 00 06 00 01 00 00 00 0B 00 0B 00 00 00 0C  00 01 00 00 00 05 00 0C 00 0D 00 00** 

**2）方法名称: 00 0E指向常量池中#14的位置**

**00  01** **00 0E** **00 0F 00 01 00 09 00 00 00 2F 00 01 00  01 00 00 00 05 2A B4 00 02 B0 00 00 00 02 00 0A  00 00 00 06 00 01 00 00 00 0B 00 0B 00 00 00 0C  00 01 00 00 00 05 00 0C 00 0D 00 00** 

![image-20241225102247872](https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/202412251022964.png)

**3)方法描述符号:00 0F 指向我们的常量池#15的位置**

**00  01 00 0E** **00 0F** **00 01 00 09 00 00 00 2F 00 01 00  01 00 00 00 05 2A B4 00 02 B0 00 00 00 02 00 0A  00 00 00 06 00 01 00 00 00 0B 00 0B 00 00 00 0C  00 01 00 00 00 05 00 0C 00 0D 00 00** 

![image-20241225102234396](https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/202412251022471.png)

**4)方法表属性个数   00 01  表示一个**

**00  01 00 0E 00 0F** **00 01** **00 09 00 00 00 2F 00 01 00  01 00 00 00 05 2A B4 00 02 B0 00 00 00 02 00 0A  00 00 00 06 00 01 00 00 00 0B 00 0B 00 00 00 0C  00 01 00 00 00 05 00 0C 00 0D 00 00** 

**5)方法结构体中的attribute_info的结构体**

   ![image-20241225102224186](https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/202412251022293.png)

**5.1)attribute_info.attribute_name_index 表示的数属性名称索引 00 09指向常量池的位置:  Code**

**00  01 00 0E 00 0F 00 01** **00 09** **00 00 00 2F 00 01 00  01 00 00 00 05 2A B4 00 02 B0 00 00 00 02 00 0A  00 00 00 06 00 01 00 00 00 0B 00 0B 00 00 00 0C  00 01 00 00 00 05 00 0C 00 0D 00 00** 

![image-20241225102216585](https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/202412251022654.png)

**5.2)attribute_info.attribute_length表示的是我们属性的长度 00 00 00 2F**

**表示后面47个字节都是我们的Code_info结构体**

**00  01 00 0E 00 0F 00 01 00 09** **00 00 00 2F** **00 01 00  01 00 00 00 05 2A B4 00 02 B0 00 00 00 02 00 0A  00 00 00 06 00 01 00 00 00 0B 00 0B 00 00 00 0C  00 01 00 00 00 05 00 0C 00 0D 00 00** 

**5.3）Code_info结构体如图所示**

![image-20241225102205867](https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/202412251022979.png)

**5.3.1)Code_info.max_stack方法操作数栈的深度**

**00 01表示方法操作数栈的深度为1**

**00  01 00 0E 00 0F 00 01 00 09 00 00 00 2F** **00 01** **00  01 00 00 00 05 2A B4 00 02 B0 00 00 00 02 00 0A  00 00 00 06 00 01 00 00 00 0B 00 0B 00 00 00 0C  00 01 00 00 00 05 00 0C 00 0D 00 00**

![image-20241225102157976](https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/202412251021057.png)

**5.3.2)Code_info.max_locals方法局部变量表的个数**

**00 01方法局部变量表的个数 1**

**00  01 00 0E 00 0F 00 01 00 09 00 00 00 2F 00 01** **00  01** **00 00 00 05 2A B4 00 02 B0 00 00 00 02 00 0A  00 00 00 06 00 01 00 00 00 0B 00 0B 00 00 00 0C  00 01 00 00 00 05 00 0C 00 0D 00 00**

![image-20241225102149885](https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/202412251021973.png)

**5.3.3)Code_info.code_length  指令码的长度** **00 00 00 05 后面紧接着5个字节就是我们的具体指令码**

**00  01 00 0E 00 0F 00 01 00 09 00 00 00 2F 00 01** **00  01** **00 00 00 05** **2A B4 00 02 B0 00 00 00 02 00 0A  00 00 00 06 00 01 00 00 00 0B 00 0B 00 00 00 0C  00 01 00 00 00 05 00 0C 00 0D 00 00**

**5.3.4)Code_info.code[code_length]   表示后面五个字节就是我们的指令码**

**00  01 00 0E 00 0F 00 01 00 09 00 00 00 2F 00 01** **00  01 00 00 00 05** **2A B4 00 02 B0** **00 00 00 02 00 0A  00 00 00 06 00 01 00 00 00 0B 00 0B 00 00 00 0C  00 01 00 00 00 05 00 0C 00 0D 00 00**

**①:****0x2A:****对应的字节码注记符是aload_0,作用就是把当前调用方法的栈帧中的局部变量表索引位置为0的局部变量推送到操作数栈的栈顶.**

**②:0xb4 getfield** 获取指定类的实例域，并将其值压入栈顶 后面是操作的字段

**00 02**表示常量池索引第二位置

**B4 00 02 表示的意思就是把userName类型实例变量的引用压入方法的操作数栈**

![image-20241225102135939](https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/202412251021011.png)

![image-20241225102130059](https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/202412251021144.png)

**③:****0xB4****---->表示为aretrun 返回**  **从当前方法返回对象引用**

**5.3.5）Code_info.exception_table_length  异常表的个数: 00 00表示方法没有异常**

**00  01 00 0E 00 0F 00 01 00 09 00 00 00 2F 00 01** **00  01 00 00 00 05** **2A B4 00 02 B0** **00 00** **00 02 00 0A  00 00 00 06 00 01 00 00 00 0B 00 0B 00 00 00 0C  00 01 00 00 00 05 00 0C 00 0D 00 00**

![image-20241225102120916](https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/202412251021992.png)

**5.3.6)code_info.attribute_count 表示code_info属性attribute_info的个数  2个**

**00  01 00 0E 00 0F 00 01 00 09 00 00 00 2F 00 01** **00  01 00 00 00 05** **2A B4 00 02 B0 00 00** **00 02** **00 0A  00 00 00 06 00 01 00 00 00 0B 00 0B 00 00 00 0C  00 01 00 00 00 05 00 0C 00 0D 00 00**

![image-20241225102111413](https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/202412251021479.png)

**5.3.7)code_info.attribute_info[1]**

![image-20241225102059859](https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/202412251020951.png)

**①:00 0A表示为attribute_name_index指向常量池10的位置**

![image-20241225102046260](https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/202412251020329.png)

**00  01 00 0E 00 0F 00 01 00 09 00 00 00 2F 00 01** **00  01 00 00 00 05** **2A B4 00 02 B0 00 00 00 02** **00 0A**  **00 00 00 06 00 01 00 00 00 0B 00 0B 00 00 00 0C  00 01 00 00 00 05 00 0C 00 0D 00 00**

**②: 00 00 00 06 表示的是attribute_length 表示长度,接着后面6个字节是我们的**

**line_number_info的结构体所再用的字节**

**00  01 00 0E 00 0F 00 01 00 09 00 00 00 2F 00 01** **00  01 00 00 00 05** **2A B4 00 02 B0 00 00 00 02 00 0A**  **00 00 00 06** **00 01 00 00 00 0B 00 0B 00 00 00 0C  00 01 00 00 00 05 00 0C 00 0D 00 00**

![image-20241225102037646](https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/202412251020723.png)

**③:****line_number_info结构体**

 **00 01：表示字节码和源码映射的对数   01表示一对**

 **00 00:  方法中的字节码的行号**

 **00 0B:   源码中的行号 11行**

**00  01 00 0E 00 0F 00 01 00 09 00 00 00 2F 00 01** **00  01 00 00 00 05** **2A B4 00 02 B0 00 00 00 02 00 0A  00 00 00 06** **00 01 00 00 00 0B** **00 0B 00 00 00 0C  00 01 00 00 00 05 00 0C 00 0D 00 00**

**5.3.7)code_info.attribute_info[2]**

![image-20241225102028054](https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/202412251020135.png)

**00  01 00 0E 00 0F 00 01 00 09 00 00 00 2F 00 01** **00  01 00 00 00 05** **2A B4 00 02 B0 00 00 00 02 00 0A  00 00 00 06 00 01 00 00 00 0B** **00 0B 00 00 00 0C  00 01 00 00 00 05 00 0C 00 0D 00 00**

**attribute_name_index  00 0B 表示的是指向我们的常量池中11的位置 为LocalVariableTable**

![image-20241225102020230](https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/202412251020301.png)

**attribute_length:****00 00 00 0C 标识属性的长度为12，那么后面的12个字符就是我们的属性表的内容**

**local_varibale_info表的结构体**

 ![image-20241225102011919](https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/202412251020991.png)

**00  01 00 0E 00 0F 00 01 00 09 00 00 00 2F 00 01** **00  01 00 00 00 05** **2A B4 00 02 B0 00 00 00 02 00 0A  00 00 00 06 00 01 00 00 00 0B 00 0B 00 00 00 0C**  **00 01 00 00 00 05 00 0C 00 0D 00 00**

 **start_pc****:****这个局部变量的生命周期开始的字节码偏移量  占用二个字节**

**00 01 00 01 00 00 00 05 2A B7 00 01 B1** **00 00 00  02 00 0A 00 00 00 06 00 01 00 00 00 06 00 0B 00  00 00 0C 00 01** **00 00** **00 05 00 0C 00 0D 00 00**

![image-20241225101822041](https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/202412251018117.png)

**length****:****作用范围覆盖的长度  占用二个字节**

**00 01 00 01 00 00 00 05 2A B7 00 01 B1** **00 00 00  02 00 0A 00 00 00 06 00 01 00 00 00 06 00 0B 00  00 00 0C 00 01 00 00** **00 05** **00 0C 00 0D 00 00**

![image-20241225101809015](https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/202412251018102.png)

**name_index****:表示局部变量的名称 二个字节** 

**00 0C****表示指向常量池12的位置**

**00 01 00 01 00 00 00 05 2A B7 00 01 B1** **00 00 00  02 00 0A 00 00 00 06 00 01 00 00 00 06 00 0B 00  00 00 0C 00 01 00 00** **00 05** **00 0C** **00 0D 00 00**

<img src="https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/202412251017049.png" alt="image-20241225101742979" />

**desc_index****:表示局部变量描述符索引 二个字节** 

 **00 0D****表示指向常量池13的位置**

**00 01 00 01 00 00 00 05 2A B7 00 01 B1** **00 00 00  02 00 0A 00 00 00 06 00 01 00 00 00 06 00 0B 00  00 00 0C 00 01 00 00** **00 05** **00 0C** **00 0D** **00 00**

![image-20241225101734878](https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/202412251017950.png)

**index****:****index是这个局部变量在栈帧局部变量表中Slot的位置。当这个变量数据类型是64位类型时（double和long），它占用的Slot为index和index+1两个**

**00 01 00 01 00 00 00 05 2A B7 00 01 B1** **00 00 00  02 00 0A 00 00 00 06 00 01 00 00 00 06 00 0B 00  00 00 0C 00 01 00 00 00 05 00 0C 00 0D** **00 00**

 ![image-20241225101725260](https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/202412251017341.png)

**第三个方法的字节码文件分析**

![image-20241225101716826](https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/202412251017927.png)

**00 01 00 10  00 11 00 02 00 09 00 00**

**00 3E 00 02 00 02 00 00  00 06 2A 2B B5 00 02 B1**

**00 00 00 02 00 0A 00 00  00 0A 00 02 00 00 00 15**

**00 05 00 16 00 0B 00 00  00 16 00 02 00 00 00 06**

**00 0C 00 0D 00 00 00 00  00 06 00 05 00 06 00 01**

**00 12 00 00 00 05 01 00  05 00 00** 

**1)访问权限修饰符(这个权限修饰符为0x0001)**

**那么权限符是acc_public**

**00 01** **00 10  00 11 00 02 00 09 00 00**

**00 3E 00 02 00 02 00 00  00 06 2A 2B B5 00 02 B1**

**00 00 00 02 00 0A 00 00  00 0A 00 02 00 00 00 15**

**00 05 00 16 00 0B 00 00  00 16 00 02 00 00 00 06**

**00 0C 00 0D 00 00 00 00  00 06 00 05 00 06 00 01**

**00 12 00 00 00 05 01 00  05 00 00** 

**2）方法名称索引指向常量池中的#16** 

  **#16 = Utf8               setUserName**

**00 01** **00 10**  **00 11 00 02 00 09 00 00**

**00 3E 00 02 00 02 00 00  00 06 2A 2B B5 00 02 B1**

**00 00 00 02 00 0A 00 00  00 0A 00 02 00 00 00 15**

**00 05 00 16 00 0B 00 00  00 16 00 02 00 00 00 06**

**00 0C 00 0D 00 00 00 00  00 06 00 05 00 06 00 01**

**00 12 00 00 00 05 01 00  05 00 00** 

**3)方法描述符号索引 指向常量池中#17的位置**

 **#17 = Utf8               (Ljava/lang/String;)V**

**00 01** **00 10**  **00 11** **00 02 00 09 00 00**

**00 3E 00 02 00 02 00 00  00 06 2A 2B B5 00 02 B1**

**00 00 00 02 00 0A 00 00  00 0A 00 02 00 00 00 15**

**00 05 00 16 00 0B 00 00  00 16 00 02 00 00 00 06**

**00 0C 00 0D 00 00 00 00  00 06 00 05 00 06 00 01**

**00 12 00 00 00 05 01 00  05 00 00** 

**4)该方法属性表的个数 为2个**

**00 01** **00 10  00 11** **00 02** **00 09 00 00**

**00 3E 00 02 00 02 00 00  00 06 2A 2B B5 00 02 B1**

**00 00 00 02 00 0A 00 00  00 0A 00 02 00 00 00 15**

**00 05 00 16 00 0B 00 00  00 16 00 02 00 00 00 06**

**00 0C 00 0D 00 00 00 00  00 06 00 05 00 06 00 01**

**00 12 00 00 00 05 01 00  05 00 00** 

**4.1)第一个属性表Code属性表结构**

![image-20241225101703270](https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/202412251017349.png)

**①: 属性名称索引 指向常量池第九个位置**

  **#9 = Utf8               Code**

**00 01** **00 10  00 11 00 02** **00 09** **00 00**

**00 3E 00 02 00 02 00 00  00 06 2A 2B B5 00 02 B1**

**00 00 00 02 00 0A 00 00  00 0A 00 02 00 00 00 15**

**00 05 00 16 00 0B 00 00  00 16 00 02 00 00 00 06**

**00 0C 00 0D 00 00 00 00  00 06 00 05 00 06 00 01**

**00 12 00 00 00 05 01 00  05 00 00** 

**②：属性长度 占用四个字节，四个字节计算出来的字节数字就是我们的Code属性内容**

**00 00 00 3E  转换成62个字节，那么我们后面的62个字节是我们的属性内容**

**00 01** **00 10  00 11 00 02 00 09** **00 00**

**00 3E** **00 02 00 02 00 00  00 06 2A 2B B5 00 02 B1**

**00 00 00 02 00 0A 00 00  00 0A 00 02 00 00 00 15**

**00 05 00 16 00 0B 00 00  00 16 00 02 00 00 00 06**

**00 0C 00 0D 00 00 00 00  00 06 00 05 00 06 00 01**

**00 12 00 00 00 05 01 00  05 00 00** 

**③：本方法最大操作数深度为2**

![image-20241225101646209](https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/202412251016282.png)

**00 01** **00 10  00 11 00 02 00 09** **00 00**

**00 3E** **00 02** **00 02 00 00  00 06 2A 2B B5 00 02 B1**

**00 00 00 02 00 0A 00 00  00 0A 00 02 00 00 00 15**

**00 05 00 16 00 0B 00 00  00 16 00 02 00 00 00 06**

**00 0C 00 0D 00 00 00 00  00 06 00 05 00 06 00 01**

**00 12 00 00 00 05 01 00  05 00 00** 

**④:局部变量表的大小为2**

![image-20241225101637822](https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/202412251016906.png)

**00 01** **00 10  00 11 00 02 00 09** **00 00**

**00 3E 00 02** **00 02** **00 00  00 06 2A 2B B5 00 02 B1**

**00 00 00 02 00 0A 00 00  00 0A 00 02 00 00 00 15**

**00 05 00 16 00 0B 00 00  00 16 00 02 00 00 00 06**

**00 0C 00 0D 00 00 00 00  00 06 00 05 00 06 00 01**

**00 12 00 00 00 05 01 00  05 00 00**

**⑤：jvm指令码长度 ,占用四个字节**   **00 00  00 06** 

**00 01** **00 10  00 11 00 02 00 09** **00 00**

**00 3E 00 02 00 02** **00 00  00 06** **2A 2B B5 00 02 B1**

**00 00 00 02 00 0A 00 00  00 0A 00 02 00 00 00 15**

**00 05 00 16 00 0B 00 00  00 16 00 02 00 00 00 06**

**00 0C 00 0D 00 00 00 00  00 06 00 05 00 06 00 01**

**00 12 00 00 00 05 01 00  05 00 00**

**⑥：jvm 指令解析     6个字节的指令码2A 2B B5 00 02 B1**

![image-20241225101629774](https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/202412251016842.png)

**00 01** **00 10  00 11 00 02 00 09** **00 00**

**00 3E 00 02 00 02 00 00  00 06** **2A 2B B5 00 02 B1**

**00 00 00 02 00 0A 00 00  00 0A 00 02 00 00 00 15**

**00 05 00 16 00 0B 00 00  00 16 00 02 00 00 00 06**

**00 0C 00 0D 00 00 00 00  00 06 00 05 00 06 00 01**

**00 12 00 00 00 05 01 00  05 00 00**

**a) 0x2A->aload_0：表示把引用类型的压到我们操作数栈栈顶**

**b) 0x2B->aload_1：把我们第二个引用类型压入到操作数栈顶**

**c)0xB5->putFiled 把我们的栈顶的值赋值给实例变量**

**d)00 02: 表示putFiled的字端，表示操作的对象 指向我们的常量池#2的位置**

**e)0xB1:->从当前方法返回void**

**⑦:exception_table_length 异常表长度  为0，那么异常表个数为0**

![image-20241225101620159](https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/202412251016235.png)

**00 01 00 10  00 11 00 02 00 09 00 00**

**00 3E 00 02 00 02 00 00  00 06 2A 2B B5 00 02 B1**

**00 00** **00 02 00 0A 00 00  00 0A 00 02 00 00 00 15**

**00 05 00 16 00 0B 00 00  00 16 00 02 00 00 00 06**

**00 0C 00 0D 00 00 00 00  00 06 00 05 00 06 00 01**

**00 12 00 00 00 05 01 00  05 00 00**

**⑧:Code属性表的attribute_info_count Code属性表的attribute属性个数**

![image-20241225101612483](https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/202412251016557.png)

**00 01 00 10  00 11 00 02 00 09 00 00**

**00 3E 00 02 00 02 00 00  00 06 2A 2B B5 00 02 B1**

**00 00** **00 02** **00 0A 00 00  00 0A 00 02 00 00 00 15**

**00 05 00 16 00 0B 00 00  00 16 00 02 00 00 00 06**

**00 0C 00 0D 00 00 00 00  00 06 00 05 00 06 00 01**

**00 12 00 00 00 05 01 00  05 00 00**

**A)Code_info的第一个属性表之lineNumberTable**

![image-20241225101601412](https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/202412251016485.png)

**attribute_name_index:0A 指向我们的常量池10的位置**

**#10 = Utf8               LineNumberTable**

**00 01 00 10  00 11 00 02 00 09 00 00**

**00 3E 00 02 00 02 00 00  00 06 2A 2B B5 00 02 B1**

**00 00 00 02 00** **0A** **00 00  00 0A 00 02 00 00 00 15**

**00 05 00 16 00 0B 00 00  00 16 00 02 00 00 00 06**

**00 0C 00 0D 00 00 00 00  00 06 00 05 00 06 00 01**

**00 12 00 00 00 05 01 00  05 00 00**

**attribute_length:占用四个字节 00 00  00 0A(10字节)**

**表示后面字节是我们的具体的属性**

![image-20241225101551071](https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/202412251015151.png)

**00 01 00 10  00 11 00 02 00 09 00 00**

**00 3E 00 02 00 02 00 00  00 06 2A 2B B5 00 02 B1**

**00 00 00 02 00 0A** **00 00  00 0A** **00 02 00 00 00 15**

**00 05 00 16 00 0B 00 00  00 16 00 02 00 00 00 06**

**00 0C 00 0D 00 00 00 00  00 06 00 05 00 06 00 01**

**00 12 00 00 00 05 01 00  05 00 00**

**line_number_table_length:占用二个字节 表示2对映射**

**00 01 00 10  00 11 00 02 00 09 00 00**

**00 3E 00 02 00 02 00 00  00 06 2A 2B B5 00 02 B1**

**00 00 00 02 00 0A** **00 00  00 0A** **00 02** **00 00 00 15**

**00 05 00 16 00 0B 00 00  00 16 00 02 00 00 00 06**

**00 0C 00 0D 00 00 00 00  00 06 00 05 00 06 00 01**

**00 12 00 00 00 05 01 00  05 00 00**

**line_number_info存在二对映射**

![image-20241225101541094](https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/202412251015178.png)

**00 01 00 10  00 11 00 02 00 09 00 00**

**00 3E 00 02 00 02 00 00  00 06 2A 2B B5 00 02 B1**

**00 00 00 02 00 0A** **00 00  00 0A** **00 02** **00 00 00 15**

**00 05 00 16** **00 0B 00 00  00 16 00 02 00 00 00 06**

**00 0C 00 0D 00 00 00 00  00 06 00 05 00 06 00 01**

**00 12 00 00 00 05 01 00  05 00 00**

**指令码 00 映射源码 00 15(21)行**

**指令码05  映射源码00 16(22行)**

**B)****Code_info的第二个属性表之LocalVariableTable**

![image-20241225101514510](https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/202412251015587.png)

**00 01 00 10  00 11 00 02 00 09 00 00**

**00 3E 00 02 00 02 00 00  00 06 2A 2B B5 00 02 B1**

**00 00 00 02 00 0A** **00 00  00 0A** **00 02 00 00 00 15**

**00 05 00 16** **00 0B** **00 00  00 16 00 02 00 00 00 06**

**00 0C 00 0D 00 00 00 00  00 06 00 05 00 06 00 01**

**00 12 00 00 00 05 01 00  05 00 00**

**attribute_name_index 00 0B指向我们的常量池11的位置**

**#11 = Utf8               LocalVariableTable**

**attribute_length表示属性的长度,后面的22个字节都是我们的属性类容**

**00 01 00 10  00 11 00 02 00 09 00 00**

**00 3E 00 02 00 02 00 00  00 06 2A 2B B5 00 02 B1**

**00 00 00 02 00 0A** **00 00  00 0A** **00 02 00 00 00 15**

**00 05 00 16 00 0B** **00 00  00 16** **00 02 00 00 00 06**

**00 0C 00 0D 00 00 00 00  00 06 00 05 00 06 00 01**

**00 12 00 00 00 05 01 00  05 00 00**

**local_variable_table_length 00 02(表示有二个本地变量表)**

**00 01 00 10  00 11 00 02 00 09 00 00**

**00 3E 00 02 00 02 00 00  00 06 2A 2B B5 00 02 B1**

**00 00 00 02 00 0A** **00 00  00 0A** **00 02 00 00 00 15**

**00 05 00 16 00 0B 00 00  00 16** **00 02** **00 00 00 06**

**00 0C 00 0D 00 00 00 00  00 06 00 05 00 06 00 01**

**00 12 00 00 00 05 01 00  05 00 00**

**Local_variale_info的变量表结构**

![image-20241225101504319](https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/202412251015425.png)

**第一个变量表:**

**00 01 00 10  00 11 00 02 00 09 00 00**

**00 3E 00 02 00 02 00 00  00 06 2A 2B B5 00 02 B1**

**00 00 00 02 00 0A** **00 00  00 0A** **00 02 00 00 00 15**

**00 05 00 16 00 0B 00 00  00 16 00 02** **00 00 00 06**

**00 0C 00 0D 00 00** **00 00  00 06 00 05 00 06 00 01**

**00 12 00 00 00 05 01 00  05 00 00**

**"start_pc":"u2(00 00 )->desc:这个局部变量的生命周期开始的字节码偏移量",**

**"length:":"u2(00 06)->作用范围覆盖的长度为6",**

**"name_index":"u2(00 0c)->字段的名称索引指向常量池12的位置 this",**

**"desc_index":"u2(00 0D)局部变量的描述符号索引->指向#13的位置Lcom/tuling/smlz/jvm/classbyatecode/TulingByteCode;",**

**"index":"u2(00 00)->desc:index是这个局部变量在栈帧局部变量表中Slot的位置"**

![image-20241225101455019](https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/202412251014098.png)

**第二个变量表:**

**00 01 00 10  00 11 00 02 00 09 00 00**

**00 3E 00 02 00 02 00 00  00 06 2A 2B B5 00 02 B1**

**00 00 00 02 00 0A** **00 00  00 0A** **00 02 00 00 00 15**

**00 05 00 16 00 0B 00 00  00 16 00 02 00 00 00 06**

**00 0C 00 0D 00 00** **00 00  00 06 00 05 00 06 00 01**

**00 12 00 00 00 05 01 00  05 00 00**

**"start_pc":"u2(00 00 )->desc:这个局部变量的生命周期开始的字节码偏移量",**

**"length:":"u2(00 06)->作用范围覆盖的长度为6",**

**"name_index":"u2(00 05)->字段的名称索引指向常量池5的位置 userName",**

**"desc_index":"u2(00 06)局部变量的描述符号索引->指向#6的位置 Ljava/lang/String;",**

**"index":"u2(00 01)->desc:index是这个局部变量在栈帧局部变量表中Slot的1位置"**

![image-20241225101443372](https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/202412251014458.png)

**B)Code_info的第二个属性表之MethodParameters方法参数属性表**

**00 01 00 10  00 11 00 02 00 09 00 00**

**00 3E 00 02 00 02 00 00  00 06 2A 2B B5 00 02 B1**

**00 00 00 02 00 0A** **00 00  00 0A** **00 02 00 00 00 15**

**00 05 00 16 00 0B 00 00  00 16 00 02 00 00 00 06**

**00 0C 00 0D 00 00** **00 00  00 06 00 05 00 06 00 01**

**00 12 00 00 00 05 01 00  05 00 00**

**结构体:**

```json
{
  "attribute_name_index":"u2(00 12)表示该属性的名称指向常量池#18的位置:MethodParameters",
  "attribute_length":"u4(00 00 00 05 )->desc:属性的长度5",
  "parameter_count":"u1(01)->desc参数的个数1个",
  "parameter_name_index":"u2(00 05)->desc:指向第五个常量池的常量userName",
  "ACC_FLAG":"U2(00 00 )->desc:表示任何权限都可以访问"
}
```

**最后一部分:class文件的属性**

**00 01** **00 13 00 00 00 02 00 14** 

**"attribute_count(class文件的属性)":"u2(00 01)只有一个属性"**

**属性结构体:**

```json
{
  "attribute_name_index":"u2(00 13) 指向常量池中#19 值为 SourceFile",
  "attribute_length":"u4(00 00 00 02) 表示属性接下来的长度为2",
  "sourceFile_index":"u2(00 14) 表示源文件的索引指向常量池20的位置:TulingByteCode.java"
}
```

