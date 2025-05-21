import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Toaster } from '@/components/ui/sonner';
import { zodResolver } from '@hookform/resolvers/zod';
import { Check, Copy, RotateCw } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import z from 'zod';
import { Card, CardContent, CardHeader } from './components/ui/card';
import { Checkbox } from './components/ui/checkbox';
import { Slider } from './components/ui/slider';
import { toast } from 'sonner';

const passwordCheckboxOptions = [
	{
		id: 'uppercase',
		label: 'Uppercase',
	},
	{
		id: 'lowercase',
		label: 'Lowercase',
	},
	{
		id: 'numbers',
		label: 'Numbers',
	},
	{
		id: 'symbols',
		label: 'Symbols',
	},
] as const;

type PasswordOptionId = (typeof passwordCheckboxOptions)[number]['id'];

const optionIds = passwordCheckboxOptions.map((o) => o.id) as [
	PasswordOptionId,
	...PasswordOptionId[]
];

const passwordFormSchema = z.object({
	password: z.string(),
});

const passwordConfigSchema = z.object({
	config: z.array(z.enum(optionIds)).refine((value) => value.length > 0, {
		message: 'You have to select at least one item.',
	}),
	length: z.number().min(8).max(32),
});

const generatePassword = ({ config, length }: { config: PasswordOptionId[]; length: number }) => {
	const hasUppercase = config.includes('uppercase');
	const hasLowercase = config.includes('lowercase');
	const hasNumbers = config.includes('numbers');
	const hasSymbols = config.includes('symbols');

	const charset = `${hasUppercase ? 'ABCDEFGHIJKLMNOPQRSTUVWXYZ' : ''}${
		hasLowercase ? 'abcdefghijklmnopqrstuvwxyz' : ''
	}${hasNumbers ? '0123456789' : ''}${hasSymbols ? '!@#$%^&*()_+[]{}|;:,.<>?' : ''}`;

	let password = '';

	if ([hasLowercase, hasUppercase, hasNumbers, hasSymbols].some((v) => v)) {
		for (let i = 0; i < length; i++) {
			const randomIndex = Math.floor(Math.random() * charset.length);
			password += charset[randomIndex];
		}
	}

	return password;
};

const passwordDefaultConfig = {
	length: 12,
	config: ['uppercase', 'lowercase', 'numbers', 'symbols'] as PasswordOptionId[],
};

function App() {
	const [isCopied, setIsCopied] = useState(false);

	// Reset the isCopied state after 2 seconds
	useEffect(() => {
		if (isCopied) {
			const timeout = setTimeout(() => {
				setIsCopied(false);
			}, 2000);

			return () => clearTimeout(timeout);
		}
	}, [isCopied]);

	const passwordForm = useForm<z.infer<typeof passwordFormSchema>>({
		resolver: zodResolver(passwordFormSchema),
		defaultValues: {
			password: generatePassword(passwordDefaultConfig),
		},
	});

	const passwordConfigForm = useForm<z.infer<typeof passwordConfigSchema>>({
		resolver: zodResolver(passwordConfigSchema),
		defaultValues: passwordDefaultConfig,
	});

	const length = passwordConfigForm.watch('length');
	const config = passwordConfigForm.watch('config');

	useEffect(() => {
		if (length) {
			passwordForm.setValue('password', generatePassword({ length, config }));
		}

		if (config.length > 0) {
			const password = generatePassword({ length, config });
			passwordForm.setValue('password', password);
		}
	}, [length, config]);

	const handleCopy = () => {
		navigator.clipboard.writeText(passwordForm.getValues('password'));
		setIsCopied(true);

		toast('Password copied to clipboard!');
	};

	const handleReset = () => {
		passwordForm.setValue('password', generatePassword({ length, config }));
	};

	return (
		<main className="flex min-h-screen flex-col items-center py-24 max-w-4xl mx-auto space-y-6 p-4">
			<h1 className="text-center mb-8 scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">
				Generate Password
			</h1>

			<Form {...passwordForm}>
				<form className="w-full space-y-6">
					<FormField
						control={passwordForm.control}
						name="password"
						render={({ field }) => (
							<FormItem>
								<FormControl>
									<div className="relative">
										<Input
											className="md:!text-3xl h-auto w-full p-2 md:p-4 pr-[90px] md:pr-[calc(140px+16px)] font-roboto-mono"
											placeholder="Enter password"
											{...field}
										/>

										<div className="absolute gap-1 md:gap-2 md:top-0.5 top-0 md:right-0.5 right-0 flex items-center">
											<Button
												className="size-10 md:size-[66px]"
												type="button"
												onClick={handleCopy}
												variant="ghost"
												size="icon"
											>
												{isCopied ? (
													<Check
														className="size-4 md:size-8"
														aria-hidden
													/>
												) : (
													<Copy
														className="size-4 md:size-8"
														aria-hidden
													/>
												)}
											</Button>

											<Button
												className="size-10 md:size-[66px]"
												type="button"
												onClick={handleReset}
												variant="ghost"
												size="icon"
											>
												<RotateCw className="size-4 md:size-8" />
											</Button>
										</div>
									</div>
								</FormControl>
							</FormItem>
						)}
					/>
				</form>
			</Form>

			<Card className="w-full">
				<CardHeader>
					<h2 className="mt-10 scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight transition-colors first:mt-0">
						Customize your password
					</h2>
				</CardHeader>

				<CardContent>
					<Form {...passwordConfigForm}>
						<form className="w-full">
							<div className="grid grid-cols-1 md:grid-cols-3 gap-x-12 gap-y-6">
								<div className="flex flex-col gap-2 col-span-2">
									<FormLabel htmlFor="password-length" className="w-full">
										Password Length
									</FormLabel>

									<FormField
										control={passwordConfigForm.control}
										name="length"
										render={({ field }) => (
											<FormItem>
												<FormControl>
													<div className="flex gap-4 items-center">
														<Input
															id="password-length"
															type="number"
															min={1}
															max={32}
															value={field.value}
															onChange={(e) =>
																field.onChange(
																	Number(e.target.value)
																)
															}
															className="w-[80px]"
														/>

														<Slider
															value={[field.value]}
															onValueChange={(value) =>
																field.onChange(value[0])
															}
															max={32}
															min={1}
															step={1}
															className="w-full"
														/>
													</div>
												</FormControl>
											</FormItem>
										)}
									/>
								</div>

								<div className="flex flex-col gap-2">
									{passwordCheckboxOptions.map((item, i) => (
										<FormField
											key={item.id + i}
											control={passwordConfigForm.control}
											name="config"
											render={({ field }) => {
												return (
													<FormItem
														key={item.id}
														className="flex flex-row items-start space-x-2 space-y-0"
													>
														<FormControl>
															<Checkbox
																className="size-6"
																checked={field.value?.includes(
																	item.id
																)}
																onCheckedChange={(checked) => {
																	return checked
																		? field.onChange([
																				...field.value,
																				item.id,
																		  ])
																		: field.onChange(
																				field.value?.filter(
																					(value) =>
																						value !==
																						item.id
																				)
																		  );
																}}
															/>
														</FormControl>

														<FormLabel className="font-medium h-full">
															{item.label}
														</FormLabel>
													</FormItem>
												);
											}}
										/>
									))}
								</div>
							</div>
						</form>
					</Form>
				</CardContent>
			</Card>

			<Toaster />
		</main>
	);
}

export default App;
