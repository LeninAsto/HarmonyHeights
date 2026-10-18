// Native dialogs provide focus containment, inert background and Escape support.
export function createDialogController(dialog, handle) {
  let opener;
  function close() { dialog.close(); }
  function open() {
    opener = document.activeElement;
    dialog.style.transform = "";
    dialog.showModal();
    document.documentElement.classList.add("dialog-open");
    const scroll = dialog.querySelector(".dialog-scroll");
    if (scroll) scroll.scrollTop = 0;
  }
  dialog.addEventListener("keydown", event => { if (event.key === "Escape") event.stopPropagation(); });
  dialog.querySelectorAll("[data-dialog-close]").forEach(button => button.addEventListener("click", close));
  let startedOutside = false;
  const outside = event => {
    const rect = dialog.getBoundingClientRect();
    return event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom;
  };
  dialog.addEventListener("pointerdown", event => { startedOutside = event.target === dialog && outside(event); });
  dialog.addEventListener("click", event => {
    if (startedOutside && event.target === dialog && outside(event)) close();
    startedOutside = false;
  });
  dialog.addEventListener("close", () => {
    dialog.style.transform = "";
    dialog.classList.remove("is-dragging");
    if (!document.querySelector("dialog[open]")) document.documentElement.classList.remove("dialog-open");
    if (opener?.isConnected && !opener.closest("[hidden]")) opener.focus({preventScroll: true});
  });
  if (handle) {
    let startY, activePointer, distance = 0;
    handle.addEventListener("pointerdown", event => {
      if (!matchMedia("(max-width: 767px)").matches || !event.isPrimary || event.button !== 0) return;
      dialog.getAnimations().forEach(animation => animation.finish());
      startY = event.clientY;
      activePointer = event.pointerId;
      distance = 0;
      handle.setPointerCapture(event.pointerId);
      dialog.classList.add("is-dragging");
    });
    handle.addEventListener("pointermove", event => {
      if (startY === undefined || event.pointerId !== activePointer) return;
      distance = Math.max(0, event.clientY - startY);
      dialog.style.transform = `translateY(${distance}px)`;
    });
    const finish = event => {
      if (startY === undefined || event.pointerId !== activePointer) return;
      const shouldClose = event.type === "pointerup" && Math.max(distance, event.clientY - startY) > 90;
      startY = undefined;
      activePointer = undefined;
      if (handle.hasPointerCapture(event.pointerId)) handle.releasePointerCapture(event.pointerId);
      dialog.classList.remove("is-dragging");
      dialog.style.transform = "";
      if (shouldClose) close();
      distance = 0;
    };
    handle.addEventListener("pointerup", finish);
    handle.addEventListener("pointercancel", finish);
    handle.addEventListener("lostpointercapture", finish);
  }
  return {open, close};
}
