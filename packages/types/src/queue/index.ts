type QueueId = "queens";

export type QueueMessage<T> = T & {
	id: QueueId;
};
