import type React from "react";
import { useRef } from "react";
import { FieldError, Form, Input, Label, TextArea, TextField } from "react-aria-components";
import { useNavigation, useSubmit } from "react-router";
import { Button as UIButton } from "../../../components/ui/button";
import type { Route } from "../contact/+types/contact";
import styles from "./contact.module.scss";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const meta: Route.MetaFunction = () => {
	return [
		{ title: "Contact - Connor Bray" },
		{ name: "description", content: "Get in touch with Connor Bray" },
	];
};

export async function action({ request }: Route.ActionArgs) {
	const formData = await request.formData();
	const name = formData.get("name") as string;
	const email = formData.get("email") as string;
	const subject = formData.get("subject") as string;
	const message = formData.get("message") as string;

	// Validate required fields
	const errors: Record<string, string> = {};

	if (!name?.trim()) {
		errors.name = "Name is required";
	}

	if (!email?.trim()) {
		errors.email = "Email is required";
	} else if (!EMAIL_REGEX.test(email)) {
		errors.email = "Please enter a valid email address";
	}

	if (!subject?.trim()) {
		errors.subject = "Subject is required";
	}

	if (!message?.trim()) {
		errors.message = "Message is required";
	}

	if (Object.keys(errors).length > 0) {
		return { success: false, errors };
	}

	// Here you would typically send the email or save to database
	// For now, we'll just simulate success
	console.log("Contact form submission:", { name, email, subject, message });

	return {
		success: true,
		message: "Thank you for your message! I'll get back to you soon.",
	};
}

export default function Contact({ actionData }: Route.ComponentProps) {
	const formRef = useRef<HTMLFormElement>(null);
	const navigation = useNavigation();
	const isSubmitting = navigation.state === "submitting";
	const submit = useSubmit();
	const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		submit(e.currentTarget);
		formRef.current?.reset();
	};

	return (
		<div className={styles.contact}>
			<header className={styles.header}>
				<h1>Get in Touch</h1>
				<p>Have a project in mind or just want to say hello? I'd love to hear from you.</p>
			</header>

			<Form
				className={styles.form}
				method="post"
				validationErrors={actionData?.errors}
				onSubmit={handleSubmit}
				ref={formRef}
			>
				<div className={styles.formGrid}>
					<TextField className={styles.field} name="name" isRequired>
						<Label>Name</Label>
						<Input placeholder="Your full name" />
						<FieldError>
							{({ validationDetails }) =>
								validationDetails.valueMissing ? "Please enter a name." : ""
							}
						</FieldError>
					</TextField>

					<TextField className={styles.field} name="email" type="email" isRequired>
						<Label>Email</Label>
						<Input placeholder="your.email@example.com" />
						<FieldError>
							{({ validationDetails }) =>
								validationDetails.valueMissing
									? "Please enter an email."
									: validationDetails.typeMismatch
										? "Please enter a valid email address."
										: ""
							}
						</FieldError>
					</TextField>
				</div>

				<TextField className={styles.field} name="subject" isRequired>
					<Label>Subject</Label>
					<Input placeholder="What's this about?" />
					<FieldError>
						{({ validationDetails }) =>
							validationDetails.valueMissing ? "Please enter a subject." : ""
						}
					</FieldError>
				</TextField>

				<TextField className={styles.field} name="message" isRequired>
					<Label>Message</Label>
					<TextArea
						placeholder="Tell me about your project, question, or just say hello..."
						rows={6}
					/>
					<FieldError>
						{({ validationDetails }) =>
							validationDetails.valueMissing ? "Please enter a message." : ""
						}
					</FieldError>
				</TextField>

				<div className={styles.submitSection}>
					<UIButton type="submit" variant="normal" color="primary" isDisabled={isSubmitting}>
						{isSubmitting ? "Sending..." : "Send Message"}
					</UIButton>
				</div>
			</Form>

			{actionData?.success && (
				<div className={`${styles.message} ${styles.success}`}>{actionData.message}</div>
			)}
		</div>
	);
}
