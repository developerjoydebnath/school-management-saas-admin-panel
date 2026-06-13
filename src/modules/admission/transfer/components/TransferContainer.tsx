"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import { ArrowRightLeft, FileOutput, FilePlus } from "lucide-react";
import TcGenerationTab from "./TcGenerationTab";
import TransferInTab from "./TransferInTab";
import InternalTransferTab from "./InternalTransferTab";

export default function TransferContainer() {
	return (
		<div className="w-full">
			<Tabs defaultValue="tc-out" className="w-full">
				<div className="mb-6 flex justify-between items-center print:hidden">
					<TabsList className="bg-card w-full justify-start overflow-x-auto rounded-lg border p-1 shadow-sm sm:w-auto h-auto">
						<TabsTrigger value="tc-out" className="gap-2 px-4 py-2">
							<FileOutput className="h-4 w-4" />
							<span className="hidden sm:inline">TC Generation (Transfer Out)</span>
							<span className="sm:hidden">TC Out</span>
						</TabsTrigger>
						<TabsTrigger value="tc-in" className="gap-2 px-4 py-2">
							<FilePlus className="h-4 w-4" />
							<span className="hidden sm:inline">Incoming Transfers (TC In)</span>
							<span className="sm:hidden">TC In</span>
						</TabsTrigger>
						<TabsTrigger value="internal" className="gap-2 px-4 py-2">
							<ArrowRightLeft className="h-4 w-4" />
							<span>Internal Transfers</span>
						</TabsTrigger>
					</TabsList>
				</div>

				<div className="bg-card rounded-lg border shadow-sm print:shadow-none print:border-none">
					<TabsContent value="tc-out" className="p-0 m-0">
						<TcGenerationTab />
					</TabsContent>

					<TabsContent value="tc-in" className="p-0 m-0 print:hidden">
						<TransferInTab />
					</TabsContent>

					<TabsContent value="internal" className="p-0 m-0 print:hidden">
						<InternalTransferTab />
					</TabsContent>
				</div>
			</Tabs>
		</div>
	);
}
