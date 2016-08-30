---
layout: post
title:  fastdb-学习笔记(九)-FastDB实现上依然存在的问题
date:   2014-12-24 13:15:00 +0800
category : 技术文档
tag : fastdb
---

* content
{:toc}


This section describes some aspects of the FastDB implementation. It is not necessary to read this section unless you want to know more about FastDB internals.

Memory allocation
=================================

Memory allocation is performed in FASTDB by bitmap. Memory is allocated in chunks called allocation quantum. In the current version of FastDB, the size of an allocation quantum is 16 byte, i.e. the size of all allocated objects is aligned on a 16 byte boundary. Each 16 byte quantum of database memory is represented by one bit in the bitmap. To locate a hole of a requested size in the bitmap, FastDB sequentially searches the bitmap pages for a correspondent number of successively cleared bits. FastDB use three arrays indexed by bitmap byte, which allows the fast calculation of the offset and the size of the hole within the byte.
FastDB performs a cyclic scan of bitmap pages. It saves the identifier of the current bitmap page and the current position within the page. Each time an allocation request arrives, scanning the bitmap starts from the (saved) current position. When the last allocated bitmap page is scanned, scanning continues from the beginning (from the first bitmap page) upto the current position. When no free space is found after a full cycle through all bitmap pages, a new bulk of memory is allocated. The size of the extension is the maximum of the size of the allocated object and of the extension quantum. The extension quantum is a parameter of the database, specified in the constructor. The bitmap is extended in order to map the additional space. If the virtual space is exhausted and no more bitmap pages can be allocated, then an OutOfMemory error is reported.

Allocating memory using a bitmap provides high locality of references (objects are mostly allocated sequentially) and also minimizes the number of modified pages. Minimizing the number of modified pages is significant when a commit operation is performed and all dirty pages should be flushed onto the disk. When all cloned objects are placed sequentially, the number of modified pages is minimal and the transaction commit time is reduced. Using the extension quantum helps to preserve sequential allocation. Once the bitmap is extended, objects will be allocated sequentially until the extension quantum is completely consumed. Only after reaching the end of the bitmap, the scan restarts from the beginning, searching for holes in previously allocated memory.

To reduce the number of bitmap page scans, FastDB associates a descriptor with each page, which is used to remember the maximal size of the hole in the page. This calculation of the maximal hole size is performed in the following way: if an object of size M can not be allocated from this bitmap page, the maximal hole size is less than M, and M is stored in the page descriptor if the previous size value of the descriptor is greater than M. For the next allocation of an object of size >= M, we will skip this bitmap page. The page descriptor is reset when some object is deallocated within this bitmap page.

Some database objects (like hash table pages) should be aligned on the page boundary to provide more efficient access. The FastDB memory allocator checks the requested size. If it is aligned on page boundary, the address of the allocated memory segment is also aligned on page boundary. A search for a free hole will be done faster in this case, because FastDB increases the step of the current position increment according to the value of the alignment.

To be able to deallocate memory used by an object, FastDB needs to keep somewhere information about the object size. There are two ways of getting the object size in FastDB. All table records are prepended by a record header, which contains the record size and a (L2-list) pointer, linking all records in the table. Such the size of the table record object can be extracted from the record header. Internal database objects (bitmap pages, T-tree and hash table nodes) have known size and are allocated without any header. Instead of this, handles for such objects contain special markers, which allow to determine the class of the object and get its size from the table of builtin object sizes. It is possible to use markers because allocation is always done in quanta of 16 bytes, so the low 4 bits of an object handle are not used.

It is possible to create a database larger than 4Gb or containing more than 4Gb of objects, if you pass values greater than 32 bit in the compiler command line for the dbDatabaseOffsetBits or the dbDatabaseOidBits parameter. In this case, FastDB will use an 8 byte integer type to represent an object handle/object identifier. It will work only at truly 64-bit operating systems, like Digital Unix.

Transactions
=================================

Each record (object) in FastDB has a unique identifier (OID). Object identifiers are used to implement references between objects. To locate an object by reference, its OID is used as an index of an array (of object offsets within the file). This array is called object index, an element of this array is a an object handle. There exist two object indices in FastDB, one of which is the current and the other the shadow. The header of the database contains pointers to both object indices and an indicator to decide which index is the current at this moment.
When an object is modified the first time, it is cloned (a copy of the object is created) and the object handle in the current index is changed to point to the newly created object copy. The shadow index still contains a handle which points to the original version of the object. All changes are done with the object copy, leaving the original object unchanged. FastDB marks in a special bitmap page of the object index, which one contains the modified object handle.

When a transaction is committed, FastDB first checks if the size of the object index was increased during the commited transaction. If so, it also reallocates the shadow copy of the object index. Then FastDB frees memory for all "old objects", i.e. objects which has been cloned within the transaction. Memory can not be deallocated before commit, because we want to preserve the consistent state of the database by keeping cloned objects unchanged. If we deallocated memory immediately after cloning, a new object could be allocated at the place of the cloned object, and we would loose consistency. As memory deallocation is done in FastDB by the bitmap using the same transaction mechanism as for normal database objects, deallocation of object space will require clearing some bits in a bitmap page, which also should be cloned before modification. Cloning a bitmap page will require new space for allocation of the page copy, and we could reuse the space of deallocated objects. But this is not acceptable due to the reasons explained above - we will loose database consistency. That is why deallocation of object is done in two steps. When an object is cloned, all bitmap pages used for marking the object space, are also cloned (if not cloned before). So when the transaction is committed, we only clear some bits in bitmap pages: no more requests for allocation of memory can be generated at this moment.

After deallocation of old copies, FastDB flushes all modified pages onto the disk to synchronize the contents of the memory and the contents of the disk file. After that, FastDB changes the current object index indicator in the database header to switch the roles of the object indices. The current object index becomes the shadow index and vice versa. Then FastDB again flushes the modified page (i.e. the page with the database header) onto the disk, transferring the database to a new consistent state. After that, FastDB copies all modified handles from the new object index to the object index which was previously shadow and now becomes current. At this moment, the contents of both indices are synchronized and FastDB is ready to start a new transaction.

The bitmap of the modified object index pages is used to minimize the duration of committing a transaction. Not the whole object index, but only its modified pages should be copied. After the transaction commitment the bitmap is cleared.

When a transaction is explicitly aborted by the dbDatabase::rollback method, the shadow object index is copied back to the current index, eliminating all changes done by the aborted transaction. After the end of copying, both indices are identical again and the database state corresponds to the state before the start of the aborted transaction.

Allocation of object handles is done by a free handle list. The header of the list is also shadowed and the two instances of the list headers are stored in the database header. A switch between them is done in the same way as between the object indices. When there are no more free elements in the list, FastDB allocates handles from the unused part of a new index. When there is no more space in the index, it is reallocated. The object index is the only entity in the database which is not cloned on modification. Instead of this, two copies of the object index are always used.

There are some predefined OID values in FastDB. OID 0 is reserved as an invalid object identifier. OID 1 is used as the identifier for the metatable object - the table containing descriptors of all other tables in the database. This table is automatically constructed during the database initialization; descriptors of all registered application classes are stored in this metatable. OID starting from 2 are reserved for bitmap pages. The number of bitmap pages depends on the maximum virtual space of the database. For 32 bit handles, the maximal virtual space is 4Gb. The number of bitmap pages can be calculated, as this size divided by page size divided by allocation quantum size divided by number of bits in the byte. For a 4 Gb virtual space, a 4 Kb page size and 16 byte allocation quantum, 8K bitmap pages are required. So 8K handles are reserved in the object index for bitmaps. Bitmap pages are allocated on demand, when the database size is extended. So the OID of the first user object will be 8194.

Recovery
=================================

The recovery procedure is trivial in FastDB. There are two instances of an object index, one of which is current and another corresponds to a consistent database state. When the database is opened, FastDB checks the database header to detect if the database was normally closed. If not, i.e. if a dirty flag is set in the database header, FastDB performs a database recovery. Recovery is very similar to rollback of transactions. The indicator of the current index in the database object header is used to determine the index corresponding to the consistent database state. Object handles from this index are copied to another object index, eliminating all changes done by uncommitted transactions. As the only action performed by the recovery procedure is copying the object index (really only handles having different values in the current and the shadow index are copied to reduce the number of modified pages) and the size of the object index is small, recovery can be done very fast. The fast recovery procedure reduces the "out-of-service" time for an application.
There is one hack which is used in FastDB to increase the database performance. All records in the table are linked in an L2-list, allowing efficient traversal through the list and insertion/removal of records. The header of the list is stored in a table object (which is the record of the Metatable). L2-list pointers are stored at the beginning of the object together with the object size. New records are always appended in FastDB at the end of the list. To provide consistent inclusion into a database list, we should clone the last record in the table and the table object itself. But if the record size is very big, cloning the last record can cause significant space and time overhead.

To eliminate this overhead, FastDB does not clone the last record but allows a temporary inconsistency of the list. In which state will the list be if a system fault happens before committing the transaction ? The consistent version of the table object will point to the record which was the last record in the previous consistent state of the database. But as this record was not cloned, it can contain pointers to a next record, which doesn't exist in this consistent database state. To fix this inconsistency, FastDB checks all tables in the database during the recovery procedure: if the last record in the table contains a non-NULL next reference, next is changed to NULL to restore consistency.

If a database file was corrupted on the disk, the only way to recover the database is to use a backup file (certainly if you do not forget to make it). A backup file can be made by the interactive SQL utility using the backup command; or by the application using the dbDatabase::backup() method. Both create a snapshot of the database in a specified file (it can be the name of a device, a tape for example). As far as a database file is always in a consistent state, the only action needed to perform recovery by means of the backup file is to replace the original database file with the backup file.

If some application starts a transaction, locks the database and then crashes, the database is left in a locked state and no other application can access it. To restore from this situation, you should stop all applications working with the database. Then restart. The first application opening the database will initialize the database monitor and perform recovery after this type of crash.

Hash table
=================================

Hash tables provide (in the average) the fastest way to locate a record in the table by key. Depending on the hash table size and quality of the hash function, one or more probes will be needed to locate the record. Hash tables are the best when most of the queries use equality comparison for record fields.
FastDB uses an extensible hash table with collision chains. The table is implemented as an array of object references with a pointer to a collision chain. Collision chain elements form a L1-list: each element contains a pointer to the next element, the hash function value and the OID of the associated record. Hash tables can be created for boolean, numeric and string fields.

To prevent the growth of collision chains, the size of a hash table is automatically increased when the table becomes full. In the current implementation, the hash table is extended when both of the following two conditions are true:

* The number of records in the tables becomes greater than the hash table size.
* The number of used elements in the hash table (i.e. number of non-empty collision chains) is greater than 2/3 of the hash table size.

The first condition allows to located each element in the hash table using one probe in average (certainly it depends on the distribution of key values and on the hash function). The second condition prevents the hash table from growing when the capacity of the set of possible key values becomes smaller then the hash table size (for example, it does not make sense to extend a hash table used for hashing char field, because no more than 256 items of the hash table can be used). Each time the hash table is extended, its size is doubled. More precisely: the hash table size is 2**n-1. Using an odd or a prime number for the hash size allows to improve the quality of hashing and efficiently allocates space for hash table, the size of which is aligned on page boundary. If the hash table size is 2**n, than we will always loose the least n bits of the hash key.

FastDB uses a very simple hash function, which despite of its simplicity can provide good results (uniformal distribution of values within the hash table). The hash code is calculated using all bytes of the key value by the following formula:

{% highlight c++ %}
h = h*31 + *key++;
{% endhighlight %}

The hash table index is the remainder of dividing the hash code by the hash table size.

T-tree
=================================

In the article "A study of index structures for main memory database management systems", T.J. Lehman and M.J Carey proposed the T-trees as a storage efficient data structure for main memory databases. T-trees are based on AVL trees proposed by Adelson-Velsky and Landis. In this subsection, we provide an overview of T-trees as implemented in FastDB.
Like AVL trees, the height of left and right subtrees of a T-tree may differ by at most one. Unlike AVL trees, each node in a T-tree stores multiple key values in a sorted order, rather than a single key value. The left-most and the right-most key value in a node define the range of key values contained in the node. Thus, the left subtree of a node contains only key values less than the left-most key value, while the right subtree contains key values greater than the right-most key value in the node. A key value which falls between the smallest and largest key value in a node is said to be bounded by that node. Note that keys equal to the smallest or largest key in the node may or may not be considered to be bounded based on whether the index is unique and based on the search condition (e.g. "greater-than" versus "greater-than or equal-to").

A node with both a left and a right child is referred to as an internal node, a node with only one child is referred to as a semi-leaf, and a node with no children is referred to as a leaf. In order to keep the occupancy high, every internal node must contain a minimum number of key values (typically k-2, if k is the maximum number of keys that can be stored in a node). However, there is no occupancy condition on the leaves or semi-leaves.

Searching for a key value in a T-tree is relatively straightforward. For every node, a check is made to see if the key value is bounded by the left-most and the right-most key value in the node; if this is the case, then the key value is returned if it is contained in the node (else, the key value is not contained in the tree). Otherwise, if the key value is less than the left-most key value, then the left child node is searched; else the right child node is searched. The process is repeated until either the key is found or the node to be searched is null.

Insertions and deletions into the T-tree are a bit more complicated. For insertions, first a variant of the search described above is used to find the node that bounds the key value to be inserted. If such a node exists, then if there is room in the node, the key value is inserted into the node. If there is no room in the node, then the key value is inserted into the node and the left-most key value in the node is inserted into the left subtree of the node (if the left subtree is empty, then a new node is allocated and the left-most key value is inserted into it). If no bounding node is found, then let N be the last node encountered by the failed search and proceed as follows: If N has room, the key value is inserted into N; else, it is inserted into a new node that is either the right or left child of N, depending on the key value and the left-most and right-most key values in N.

Deletion of a key value begins by determining the node containing the key value, and the key value is deleted from the node. If deleting the key value results in an empty leaf node, then the node is deleted. If the deletion results in an internal node or semi-leaf containing fewer than the minimum number of key values, then the deficit is made up by moving the largest key in the left subtree into the node, or by merging the node with its right child.

In both insert and delete, allocation/deallocation of a node may cause the tree to become unbalanced and rotations (RR, RL, LL, LR) may be necessary. The heights of subtrees in the following description include the effects of the insert or delete operation. In case of an insert, nodes along the path from the newly allocated node to the root are examined until

* either a node for which the two subtrees have equal heights is found (in this case no rotation needs to be performed),
* or a node for which the difference in heights between the left and the right subtrees is more than one is found and a single rotation involving the node is performed.

In the case of delete, nodes along the path from the de-allocated node's parent to the root are examined until a node is found whose subtrees' heights now differ by one. Furthermore, every time a node whose subtrees' heights differ by more than one is encountered, a rotation is performed. Note that de-allocation of a node may result in multiple rotations.

<br>
<br>

参考资料
=================================

fastdb主页 : [http://www.garret.ru/fastdb.html](http://www.garret.ru/fastdb.html)

FastDB SourceForge主页 : [http://sourceforge.net/projects/fastdb](http://sourceforge.net/projects/fastdb)

FastDB SourceForge下载 :

[http://sourceforge.net/projects/fastdb/files/latest/download](http://sourceforge.net/projects/fastdb/files/latest/download)

参考博客 ：

[http://blog.csdn.net/fuyun10036/article/details/8620542](http://blog.csdn.net/fuyun10036/article/details/8620542)