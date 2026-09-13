class BugReportModal {
    constructor() {
        this.modal = null;
        this.form = null;
        this.init();
    }

    init() {
        this.modal = document.createElement("div");
        this.modal.className = "bug-modal-overlay";
        this.modal.style.cssText = "display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.7); justify-content:center; align-items:center; z-index:99999; font-family:sans-serif;";

        this.modal.innerHTML = `
      <div class="bug-modal-content" style="background:#14141491 !important; color:#ffffff !important; padding:24px !important; border-radius:10px !important; width:420px !important; box-shadow: 0 10px 25px rgba(0,0,0,0.8) !important; display:flex !important; flex-direction:column !important; gap:16px !important; border: 1px solid #333 !important; box-sizing: border-box !important;">
        <h3 style="margin:0 !important; font-size:1.2rem !important; font-weight:600 !important; color:#ffffff !important;">Report a Bug</h3>
        <form id="bugReportForm" style="display:flex !important; flex-direction:column !important; gap:12px !important; width:unset !important; margin:0 !important; background:transparent !important; box-shadow: unset !important;">
          <div style="display:flex !important; flex-direction:column !important; gap:4px !important;">
            <label style="font-size:0.85rem !important; color:#aaaaaa !important;">Title <span style="color: red; font-weight: bold" >*</span> </label>
            <input type="text" id="bugTitle" required style="background:#2a2a2a !important; border:1px solid #444 !important; color:#ffffff !important; border-radius:6px !important; padding:8px 10px !important; outline:none !important; width:100% !important; box-sizing: border-box !important;" />
          </div>
          <div style="display:flex !important; flex-direction:column !important; gap:4px !important;">
            <label style="font-size:0.85rem !important; color:#aaaaaa !important;">Description <span style="color: red; font-weight: bold" >*</span></label>
            <textarea id="bugDescription" placeholder="Provide some details about the bug" required rows="4" style="background:#2a2a2a !important; border:1px solid #444 !important; color:#ffffff !important; border-radius:6px !important; padding:8px 10px !important; outline:none !important; resize:vertical !important; width:100% !important; box-sizing: border-box !important;"></textarea>
          </div>
          <div style="display:flex !important; flex-direction:column !important; gap:4px !important;">
            <label style="font-size:0.85rem !important; color:#aaaaaa !important;">Include Logs From Today</label>
            <select id="bugIncludeLogs" style="background:#2a2a2a !important; border:1px solid #444 !important; color:#ffffff !important; border-radius:6px !important; padding:8px 10px !important; outline:none !important; width:100% !important; box-sizing: border-box !important;">
              <option value="yes" style="background:#2a2a2a !important; color:#ffffff !important;">Yes</option>
              <option value="no" style="background:#2a2a2a !important; color:#ffffff !important;">No</option>
            </select>
          </div>
          <div style="display:flex !important; justify-content:flex-end !important; gap:8px !important; margin-top:8px !important;">
            <button type="button" id="bugCancelBtn" style="background:#333333 !important; border:none !important; color:#cccccc !important; padding:8px 14px !important; border-radius:6px !important; cursor:pointer !important;">Cancel</button>
            <button type="submit" style="background:#4f46e5 !important; border:none !important; color:#ffffff !important; padding:8px 16px !important; border-radius:6px !important; cursor:pointer !important; font-weight:500 !important;">Send</button>
          </div>
        </form>
      </div>
    `;

        document.body.appendChild(this.modal);
        this.form = this.modal.querySelector("#bugReportForm");

        this.bindEvents();
    }

    bindEvents() {
        const titleInput = this.modal.querySelector("#bugTitle");
        const descInput = this.modal.querySelector("#bugDescription");

        titleInput.addEventListener("input", () => {
            localStorage.setItem("draft_bug_title", titleInput.value);
        });

        descInput.addEventListener("input", () => {
            localStorage.setItem("draft_bug_desc", descInput.value);
        });

        this.modal.querySelector("#bugCancelBtn").addEventListener("click", () => {
            this.close();
        });

        this.modal.addEventListener("click", (e) => {
            if (e.target === this.modal) {
                this.close();
            }
        });

        this.form.addEventListener("submit", async (e) => {
            e.preventDefault();
            const data = {
                title: titleInput.value,
                description: descInput.value,
                includeLogs: this.modal.querySelector("#bugIncludeLogs").value
            };

            window.electronAPI.logInfo("Submitting:", data);

            try {
                const success = await window.electronAPI.sendReport(data);

                if (success) {
                    localStorage.removeItem("draft_bug_title");
                    localStorage.removeItem("draft_bug_desc");
                    this.form.reset();
                    this.close();
                    window.showSuccess("Bug report sent successfully!");
                }
            } catch (err) {
                window.showError("Failed to send bug report.");
                window.electronAPI.logError("Failed to send bug report:", err.message);
            }
        });
    }

    loadState() {
        const savedTitle = localStorage.getItem("draft_bug_title");
        const savedDesc = localStorage.getItem("draft_bug_desc");

        if (savedTitle) {
            this.modal.querySelector("#bugTitle").value = savedTitle;
        }
        if (savedDesc) {
            this.modal.querySelector("#bugDescription").value = savedDesc;
        }
    }

    open() {
        this.loadState();
        this.modal.style.display = "flex";
    }

    close() {
        this.modal.style.display = "none";
    }
}

window.bugModal = new BugReportModal();

document.getElementById("report-bug-btn").addEventListener("click", () => {
    window.bugModal.open();
});