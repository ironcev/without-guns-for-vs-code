// The example is compiled out of the following open source files:
// - SwissKnife/Source/SwissKnife/Collections/CollectionExtensions.cs (https://github.com/ironcev/SwissKnife/blob/fb04fc8ace2c5d840727ebfd674021f59848bdff/Source/SwissKnife/Collections/CollectionExtensions.cs)
// - nunit/src/NUnitFramework/framework/Internal/Execution/SimpleWorkItemDispatcher.cs (https://github.com/nunit/nunit/blob/5baba3d2cc1bb1134676b587cfe6ebaf040c5c9d/src/NUnitFramework/framework/Internal/Execution/SimpleWorkItemDispatcher.cs)
// - AsyncEx/src/Nito.AsyncEx.Interop.WaitHandles/Interop/WaitHandleAsyncFactory.cs (https://github.com/StephenCleary/AsyncEx/blob/3fca9ed78a3c6cd129ce5328444de19d1a7637aa/src/Nito.AsyncEx.Interop.WaitHandles/Interop/WaitHandleAsyncFactory.cs)

using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using SwissKnife.Diagnostics.Contracts;

namespace SwissKnife.Collections
{
    /// <summary>
    /// Contains extension methods that can be applied on different types of collections.
    /// </summary>
    /// <threadsafety static="false"/>
    public static class CollectionExtensions
    {
        // Random generator used in the Randomize<T> and Random<T> methods.
        // It's perfectly fine if different threads start with the same seed (in case that the Random objects are created very shortly one ofter another).
        private static readonly ThreadLocal<Random> random = new ThreadLocal<Random>(() => new Random());

        /// <summary>
        /// Adds one or more items to a collection.
        /// </summary>
        /// <typeparam name="T">The type of the items in the <paramref name="collection"/>.</typeparam>
        /// <param name="collection">The collection to which to add <paramref name="itemsToAdd"/>.</param>
        /// <param name="itemsToAdd">Items that has to be added to the <paramref name="collection"/>.</param>
        /// <exception cref="ArgumentNullException"><paramref name="collection"/> is null.<br/>-or-<br/><paramref name="itemsToAdd"/> is null.</exception>
        /// <exception cref="NotSupportedException"><paramref name="collection"/> is read-only.</exception>
        // TODO-IG: What if the collection checks for duplicates or similar? Exception could be thrown. Test and document that case.
        public static void AddMany<T>(this ICollection<T> collection, IEnumerable<T> itemsToAdd)
        {
            Argument.IsNotNull(collection, "collection");
            Argument.IsNotNull(itemsToAdd, "itemsToAdd");

            foreach (T item in itemsToAdd)
                collection.Add(item);
        }

        /// <summary>
        /// Gets the value from a dictionary associated with a key. If the value does not exist in the dictionary it will be added to it.
        /// </summary>
        /// <remarks>
        /// <para>
        /// If the <paramref name="dictionary"/> does not contain the <paramref name="key"/>, a new <see cref="KeyValuePair{TKey,TValue}"/> will be added to the <paramref name="dictionary"/>.
        /// The key and the value of that new <see cref="KeyValuePair{TKey,TValue}"/> will be set to <paramref name="key"/> and the result of the <paramref name="getValueToAdd"/> respectively.
        /// The <paramref name="getValueToAdd"/> is called only if the <paramref name="dictionary"/> does not already contain the <paramref name="key"/>.
        /// </para>
        /// <note type="caution">
        /// If the <paramref name="getValueToAdd"/> throws an exception, that exception will be propagated to the caller.
        /// </note>
        /// </remarks>
        /// <typeparam name="TKey">The type of keys in the <paramref name="dictionary"/>.</typeparam>
        /// <typeparam name="TValue">The type of values in the <paramref name="dictionary"/>.</typeparam>
        /// <param name="dictionary">The dictionary from which the value has to be get.</param>
        /// <param name="key">The key associated with the value.</param>
        /// <param name="getValueToAdd">
        /// The function that returns the value that has to be inserted into the <paramref name="dictionary"/> if it does not contain the <paramref name="key"/>.
        /// This function will be called only if the <paramref name="dictionary"/> does not already contain the <paramref name="key"/>.
        /// </param>
        /// <returns>
        /// Already existing value associated to the <paramref name="key"/> or the newly added value returned by the <paramref name="getValueToAdd"/>.
        /// </returns>
        /// <exception cref="ArgumentNullException"><paramref name="dictionary"/> is null.<br/>-or-<br/><paramref name="key"/> is null.<br/>-or-<br/><paramref name="getValueToAdd"/> is null.</exception>
        /// <exception cref="NotSupportedException"><paramref name="dictionary"/> is read-only.</exception>
        public static TValue GetValue<TKey, TValue>(this IDictionary<TKey, TValue> dictionary, TKey key, Func<TValue> getValueToAdd)
        {
            Argument.IsNotNull(dictionary, "dictionary");
            Argument.IsNotNull(key, "key");
            Argument.IsNotNull(getValueToAdd, "getValueToAdd");

            if (!dictionary.ContainsKey(key))
                dictionary.Add(key, getValueToAdd());

            return dictionary[key];
        }

        /// <summary>
        /// Splits a collection into groups of defined size.
        /// </summary>
        /// <remarks>
        /// <para>
        /// This method is implemented by using deferred execution. The immediate return value is an object that stores all the information that is required to perform the action.
        /// The query represented by this method is not executed until the object is enumerated either by calling its <b>GetEnumerator</b> method directly or by using <b>foreach</b>
        /// in Visual C# or <b>For Each</b> in Visual Basic.
        /// </para>
        /// <para>
        /// The <paramref name="groupSize"/> can be greater than the number of elements in the <paramref name="source"/>. In that case, the result contains only one group which is the same as the <paramref name="source"/>.
        /// </para>
        /// <para>
        /// Splitting preserves the order of the elements.
        /// </para>
        /// </remarks>
        /// <typeparam name="T">The type of the elements contained in the <paramref name="source"/>.</typeparam>
        /// <param name="source">The collection to split into groups.</param>
        /// <param name="groupSize">The number of elements in each group except eventually the last one. The last group can have less elements than the group size.</param>
        /// <returns>Enumerable whose each element is an <see cref="IEnumerable{T}"/> that represents a single group.<br/>-or-<br/>Empty enumerable if the <paramref name="source"/> is empty.</returns>
        /// <exception cref="ArgumentNullException"><paramref name="source"/> is null.</exception>
        /// <exception cref="ArgumentOutOfRangeException"><paramref name="groupSize"/> is not greater than zero.</exception>
        public static IEnumerable<IEnumerable<T>> Split<T>(this IEnumerable<T> source, int groupSize)
        {
            Argument.IsNotNull(source, "source");
            Argument.IsGreaterThanZero(groupSize, "groupSize");

            return source
                .Select((element, index) => new { Index = index / groupSize, Element = element })
                .GroupBy(y => y.Index)
                .Select(v => v.Select(t => t.Element));
        }

        /// <summary>
        /// Splits collection into specified number of groups.
        /// </summary>
        /// <remarks>
        /// <para>
        /// This method is implemented by using deferred execution. The immediate return value is an object that stores all the information that is required to perform the action.
        /// The query represented by this method is not executed until the object is enumerated either by calling its <b>GetEnumerator</b> method directly or by using <b>foreach</b>
        /// in Visual C# or <b>For Each</b> in Visual Basic.
        /// </para>
        /// <para>
        /// The <paramref name="numberOfGroups"/> can be greater than or equal to the number of elements in the <paramref name="source"/>.
        /// In both case, the result contains groups of size 1.
        /// The number of returned groups will be equal to the number of elements in the <paramref name="source"/>.
        /// </para>
        /// <para>
        /// All groups except maybe the last one will have same number of elements. The last group can have less elements than other groups.
        /// </para>
        /// <para>
        /// Splitting preserves the order of the elements.
        /// </para>
        /// </remarks>
        /// <typeparam name="T">The type of the elements contained in the <paramref name="source"/>.</typeparam>
        /// <param name="source">The collection to split into groups.</param>
        /// <param name="numberOfGroups">The number of resulting groups. The exact number of resulting is either equal to this value or to the number of elements in the <paramref name="source"/>.</param>
        /// <returns>Enumerable whose each element is an <see cref="IEnumerable{T}"/> that represents a single group.<br/>-or-<br/>Empty enumerable if the <paramref name="source"/> is empty.</returns>
        /// <exception cref="ArgumentNullException"><paramref name="source"/> is null.</exception>
        /// <exception cref="ArgumentOutOfRangeException"><paramref name="numberOfGroups"/> is not greater than zero.</exception>
        public static IEnumerable<IEnumerable<T>> SplitByNumberOfGroups<T>(this IEnumerable<T> source, int numberOfGroups)
        {
            Argument.IsNotNull(source, "source");
            Argument.IsGreaterThanZero(numberOfGroups, "numberOfGroups");

            List<T> sourceAsList = source.ToList();
            int numberOfElements = sourceAsList.Count;

            if (numberOfElements == 0)
                yield break;

            // We cannot have more groups then elements.
            numberOfGroups = Math.Min(numberOfElements, numberOfGroups);

            // Since numberOfGroups is greater than zero and numberOfElements is greater than zero,
            // we know that newly calculated numberOfGroups will never be zero.
            // Therefore, the below devision will never be devision by zero.

            int groupSize = (int)Math.Ceiling(numberOfElements / (double)numberOfGroups);

            foreach (var group in Split(sourceAsList, groupSize))
                yield return group;
        }

        /// <inheritdoc cref="ToEnumerable(IEnumerator)" />
        /// <typeparam name="T">The type of the elements enumerated by the <paramref name="enumerator"/>.</typeparam>
        public static IEnumerable<T> ToEnumerable<T>(this IEnumerator<T> enumerator)
        {
            Argument.IsNotNull(enumerator, "enumerator");

            List<T> result = new List<T>();

            enumerator.Reset();
            while (enumerator.MoveNext())
            {
                result.Add(enumerator.Current);
            }

            return result;
        }

        /// <summary>
        /// Returns a random element from a sequence or <see cref="Option{T}.None"/> if the sequence is empty.
        /// </summary>
        /// <inheritdoc cref="Random{T}(IEnumerable{T}, Predicate{T})" select="param[@name='source']"/>
        /// <inheritdoc cref="Random{T}(IEnumerable{T}, Predicate{T})" select="typeparam"/>
        /// <returns>
        /// <see cref="Option{T}.None"/> if the <paramref name="source"/> is empty; otherwise, a random element in <paramref name="source"/>.
        /// </returns>
        /// <exception cref="ArgumentNullException"><paramref name="source"/> is null.</exception>
        public static Option<T> Random<T>(this IEnumerable<T> source) where T : class
        {
            return Random(source, x => true);
        }
    }
}

using System.Collections.Generic;
using System.Diagnostics;
using System.Threading;

namespace NUnit.Framework.Internal.Execution
{
    /// <summary>
    /// SimpleWorkItemDispatcher handles execution of WorkItems by
    /// directly executing them. It is provided so that a dispatcher
    /// is always available in the context, thereby simplifying the
    /// code needed to run child tests.
    /// </summary>
    public class SimpleWorkItemDispatcher : IWorkItemDispatcher
    {
#if !NETSTANDARD1_3 && !NETSTANDARD1_6
        // The first WorkItem to be dispatched, assumed to be top-level item
        private WorkItem _topLevelWorkItem;

        // Thread used to run and cancel tests
        private Thread _runnerThread;
#endif

        #region IWorkItemDispatcher Members

        /// <summary>
        /// Start execution, creating the execution thread,
        /// setting the top level work  and dispatching it.
        /// </summary>
        public void Start(WorkItem topLevelWorkItem)
        {
#if NETSTANDARD1_3 || NETSTANDARD1_6
            Dispatch(topLevelWorkItem);
#else
            _topLevelWorkItem = topLevelWorkItem;
            _runnerThread = new Thread(RunnerThreadProc);

            if (topLevelWorkItem.TargetApartment == ApartmentState.STA)
                _runnerThread.SetApartmentState(ApartmentState.STA);

            _runnerThread.Start();
#endif
        }

        /// <summary>
        /// Dispatch a single work item for execution by
        /// executing it directly.
        /// <param name="work">The item to dispatch</param>
        /// </summary>
        public void Dispatch(WorkItem work)
        {
            if (work != null)
                work.Execute();
        }

#if !NETSTANDARD1_3 && !NETSTANDARD1_6
        private void RunnerThreadProc()
        {
            _topLevelWorkItem.Execute();
        }
#endif

#if !NETSTANDARD1_3 && !NETSTANDARD1_6
        private object cancelLock = new object();
#endif

        /// <summary>
        /// Cancel (abort or stop) the ongoing run.
        /// If no run is in process, the call has no effect.
        /// </summary>
        /// <param name="force">true if the run should be aborted, false if it should allow its currently running test to complete</param>
        public void CancelRun(bool force)
        {
#if !NETSTANDARD1_3 && !NETSTANDARD1_6
            lock (cancelLock)
            {
                if (_topLevelWorkItem != null)
                {
                    _topLevelWorkItem.Cancel(force);
                    if (force)
                        _topLevelWorkItem = null;
                }
            }
#endif
        }
#endregion
    }
}

using System;
using System.Threading;
using System.Threading.Tasks;

namespace Nito.AsyncEx.Interop
{
    /// <summary>
    /// Provides interop utilities for <see cref="WaitHandle"/> types.
    /// </summary>
    public static class WaitHandleAsyncFactory
    {
        /// <summary>
        /// Wraps a <see cref="WaitHandle"/> with a <see cref="Task"/>. When the <see cref="WaitHandle"/> is signalled, the returned <see cref="Task"/> is completed. If the handle is already signalled, this method acts synchronously.
        /// </summary>
        /// <param name="handle">The <see cref="WaitHandle"/> to observe.</param>
        public static Task FromWaitHandle(WaitHandle handle)
        {
            return FromWaitHandle(handle, Timeout.InfiniteTimeSpan, CancellationToken.None);
        }

        /// <summary>
        /// Wraps a <see cref="WaitHandle"/> with a <see cref="Task{Boolean}"/>. If the <see cref="WaitHandle"/> is signalled, the returned task is completed with a <c>true</c> result. If the observation times out, the returned task is completed with a <c>false</c> result. If the handle is already signalled or the timeout is zero, this method acts synchronously.
        /// </summary>
        /// <param name="handle">The <see cref="WaitHandle"/> to observe.</param>
        /// <param name="timeout">The timeout after which the <see cref="WaitHandle"/> is no longer observed.</param>
        public static Task<bool> FromWaitHandle(WaitHandle handle, TimeSpan timeout)
        {
            return FromWaitHandle(handle, timeout, CancellationToken.None);
        }

        /// <summary>
        /// Wraps a <see cref="WaitHandle"/> with a <see cref="Task{Boolean}"/>. If the <see cref="WaitHandle"/> is signalled, the returned task is (successfully) completed. If the observation is cancelled, the returned task is cancelled. If the handle is already signalled or the cancellation token is already cancelled, this method acts synchronously.
        /// </summary>
        /// <param name="handle">The <see cref="WaitHandle"/> to observe.</param>
        /// <param name="token">The cancellation token that cancels observing the <see cref="WaitHandle"/>.</param>
        public static Task FromWaitHandle(WaitHandle handle, CancellationToken token)
        {
            return FromWaitHandle(handle, Timeout.InfiniteTimeSpan, token);
        }

        /// <summary>
        /// Wraps a <see cref="WaitHandle"/> with a <see cref="Task{Boolean}"/>. If the <see cref="WaitHandle"/> is signalled, the returned task is completed with a <c>true</c> result. If the observation times out, the returned task is completed with a <c>false</c> result. If the observation is cancelled, the returned task is cancelled. If the handle is already signalled, the timeout is zero, or the cancellation token is already cancelled, then this method acts synchronously.
        /// </summary>
        /// <param name="handle">The <see cref="WaitHandle"/> to observe.</param>
        /// <param name="timeout">The timeout after which the <see cref="WaitHandle"/> is no longer observed.</param>
        /// <param name="token">The cancellation token that cancels observing the <see cref="WaitHandle"/>.</param>
        public static Task<bool> FromWaitHandle(WaitHandle handle, TimeSpan timeout, CancellationToken token)
        {
            // Handle synchronous cases.
            var alreadySignalled = handle.WaitOne(0);
            if (alreadySignalled)
                return TaskConstants.BooleanTrue;
            if (timeout == TimeSpan.Zero)
                return TaskConstants.BooleanFalse;
            if (token.IsCancellationRequested)
                return TaskConstants<bool>.Canceled;

            // Register all asynchronous cases.
            return DoFromWaitHandle(handle, timeout, token);
        }

        private static async Task<bool> DoFromWaitHandle(WaitHandle handle, TimeSpan timeout, CancellationToken token)
        {
            var tcs = new TaskCompletionSource<bool>();
            using (new ThreadPoolRegistration(handle, timeout, tcs))
            using (token.Register(state => ((TaskCompletionSource<bool>) state).TrySetCanceled(), tcs, useSynchronizationContext: false))
                return await tcs.Task.ConfigureAwait(false);
        }

        private sealed class ThreadPoolRegistration : IDisposable
        {
            private readonly RegisteredWaitHandle _registeredWaitHandle;

            public ThreadPoolRegistration(WaitHandle handle, TimeSpan timeout, TaskCompletionSource<bool> tcs)
            {
                _registeredWaitHandle = ThreadPool.RegisterWaitForSingleObject(handle,
                    (state, timedOut) => ((TaskCompletionSource<bool>)state).TrySetResult(!timedOut), tcs,
                    timeout, executeOnlyOnce: true);
            }

            void IDisposable.Dispose() => _registeredWaitHandle.Unregister(null);
        }
    }
}