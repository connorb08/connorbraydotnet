type QueueKey = "queens";

export type QueueMessage<T> = T & {
	queueKey: QueueKey;
};
